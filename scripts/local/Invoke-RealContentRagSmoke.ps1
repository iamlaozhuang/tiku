$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$sourceRoot = Join-Path $repoRoot "rawfiles"
$maxFileCount = 1
$maxExtractedCharacterCount = 12000
$maxChunkCount = 6
$chunkCharacterCount = 900
$citationLimit = 2

function Get-HashPrefix {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
        $hashBytes = $sha256.ComputeHash($bytes)
        return ([System.BitConverter]::ToString($hashBytes) -replace "-", "").ToLowerInvariant().Substring(0, 12)
    } finally {
        $sha256.Dispose()
    }
}

function Write-SmokeSummary {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Summary
    )

    $sanitizedSummary = [ordered]@{
        result = $Summary.result
        failureClass = $Summary.failureClass
        sourceLocation = $Summary.sourceLocation
        boundedSample = $true
        maxFileCount = $maxFileCount
        maxExtractedCharacterCount = $maxExtractedCharacterCount
        maxChunkCount = $maxChunkCount
        supportedExtension = $Summary.supportedExtension
        sourceSizeByte = $Summary.sourceSizeByte
        sourceHashPrefix = $Summary.sourceHashPrefix
        knowledgeBase = $Summary.knowledgeBase
        resource = $Summary.resource
        chunkSummary = $Summary.chunkSummary
        retrievalSummary = $Summary.retrievalSummary
        evidenceStatus = $Summary.evidenceStatus
        providerCall = "not_run"
        databaseWrite = "not_run"
        redaction = "redacted; no raw content; ignored_rawfiles; bounded sample; no raw prompt; no raw answer; no model response; no provider payload"
    }

    $sanitizedSummary | ConvertTo-Json -Depth 8
}

function Test-IgnoredSourceRoot {
    if (-not (Test-Path -LiteralPath $sourceRoot)) {
        return $false
    }

    & git -C $repoRoot check-ignore -q -- "rawfiles"
    return $LASTEXITCODE -eq 0
}

function Read-BoundedDocxText {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [int]$Limit
    )

    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $archive = [System.IO.Compression.ZipFile]::OpenRead($Path)
    try {
        $entry = $archive.GetEntry("word/document.xml")
        if ($null -eq $entry) {
            return ""
        }

        $reader = [System.IO.StreamReader]::new($entry.Open(), [System.Text.Encoding]::UTF8)
        try {
            $documentXml = $reader.ReadToEnd()
        } finally {
            $reader.Dispose()
        }

        $textBuilder = [System.Text.StringBuilder]::new()
        $matches = [regex]::Matches($documentXml, "<w:t(?:\s[^>]*)?>(.*?)</w:t>", "Singleline")
        foreach ($match in $matches) {
            $decoded = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
            if ([string]::IsNullOrWhiteSpace($decoded)) {
                continue
            }

            [void]$textBuilder.Append($decoded.Trim())
            [void]$textBuilder.Append(" ")

            if ($textBuilder.Length -ge $Limit) {
                break
            }
        }

        $boundedText = $textBuilder.ToString().Trim()
        if ($boundedText.Length -gt $Limit) {
            return $boundedText.Substring(0, $Limit)
        }

        return $boundedText
    } finally {
        $archive.Dispose()
    }
}

function Read-BoundedPlainText {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [int]$Limit
    )

    $boundedText = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    if ($boundedText.Length -gt $Limit) {
        return $boundedText.Substring(0, $Limit)
    }

    return $boundedText
}

function New-RagChunks {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Text
    )

    $chunks = [System.Collections.Generic.List[object]]::new()
    $cursor = 0
    while ($cursor -lt $Text.Length -and $chunks.Count -lt $maxChunkCount) {
        $remainingLength = $Text.Length - $cursor
        $length = [Math]::Min($chunkCharacterCount, $remainingLength)
        $currentText = $Text.Substring($cursor, $length).Trim()
        if (-not [string]::IsNullOrWhiteSpace($currentText)) {
            $chunks.Add([pscustomobject]@{
                index = $chunks.Count
                text = $currentText
                charLength = $currentText.Length
                hashPrefix = Get-HashPrefix -Value $currentText
            })
        }

        $cursor += $chunkCharacterCount
    }

    return @($chunks)
}

function Get-QueryTerms {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Text
    )

    $terms = [regex]::Matches($Text.ToLowerInvariant(), "[\p{L}\p{N}]{2,}") |
        ForEach-Object { $_.Value } |
        Select-Object -First 8

    return @($terms)
}

function Select-CitationChunks {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$Chunks,

        [Parameter(Mandatory = $true)]
        [string[]]$QueryTerms
    )

    if ($Chunks.Count -eq 0) {
        return @()
    }

    $rankedChunks = foreach ($chunk in $Chunks) {
        $lowerText = $chunk.text.ToLowerInvariant()
        $score = 0
        foreach ($term in $QueryTerms) {
            if ($lowerText.Contains($term)) {
                $score += 1
            }
        }

        [pscustomobject]@{
            chunk = $chunk
            score = $score
        }
    }

    return @(
        $rankedChunks |
            Sort-Object -Property @{ Expression = "score"; Descending = $true }, @{ Expression = { $_.chunk.index }; Descending = $false } |
            Select-Object -First $citationLimit |
            ForEach-Object { $_.chunk }
    )
}

if (-not (Test-IgnoredSourceRoot)) {
    Write-SmokeSummary -Summary @{
        result = "blocked"
        failureClass = "missing_or_unignored_source_root"
        sourceLocation = "missing_ignored_rawfiles"
        supportedExtension = $null
        sourceSizeByte = $null
        sourceHashPrefix = $null
        knowledgeBase = $null
        resource = $null
        chunkSummary = $null
        retrievalSummary = $null
        evidenceStatus = "none"
    }
    exit 1
}

$candidateSources = @(
    Get-ChildItem -LiteralPath $sourceRoot -Recurse -File -Include "*.docx", "*.txt", "*.md" |
        Where-Object { $_.Length -gt 0 } |
        Sort-Object -Property Length, LastWriteTime |
        Select-Object -First $maxFileCount
)

if ($candidateSources.Count -eq 0) {
    Write-SmokeSummary -Summary @{
        result = "blocked"
        failureClass = "no_supported_real_content_input"
        sourceLocation = "ignored_rawfiles"
        supportedExtension = $null
        sourceSizeByte = $null
        sourceHashPrefix = $null
        knowledgeBase = $null
        resource = $null
        chunkSummary = $null
        retrievalSummary = $null
        evidenceStatus = "none"
    }
    exit 1
}

$selectedSource = $candidateSources[0]
$extension = $selectedSource.Extension.ToLowerInvariant()
$sourceHashPrefix = (Get-FileHash -LiteralPath $selectedSource.FullName -Algorithm SHA256).Hash.ToLowerInvariant().Substring(0, 12)

if ($extension -eq ".docx") {
    $extractedText = Read-BoundedDocxText -Path $selectedSource.FullName -Limit $maxExtractedCharacterCount
} else {
    $extractedText = Read-BoundedPlainText -Path $selectedSource.FullName -Limit $maxExtractedCharacterCount
}

if ([string]::IsNullOrWhiteSpace($extractedText)) {
    Write-SmokeSummary -Summary @{
        result = "blocked"
        failureClass = "empty_extracted_content"
        sourceLocation = "ignored_rawfiles"
        supportedExtension = $extension
        sourceSizeByte = $selectedSource.Length
        sourceHashPrefix = $sourceHashPrefix
        knowledgeBase = $null
        resource = $null
        chunkSummary = $null
        retrievalSummary = $null
        evidenceStatus = "none"
    }
    exit 1
}

$chunks = New-RagChunks -Text $extractedText
$queryTerms = Get-QueryTerms -Text $chunks[0].text
$queryHashPrefix = Get-HashPrefix -Value ($queryTerms -join "|")
$citationChunks = Select-CitationChunks -Chunks $chunks -QueryTerms $queryTerms
$evidenceStatus = if ($citationChunks.Count -ge 2) {
    "sufficient"
} elseif ($citationChunks.Count -eq 1) {
    "weak"
} else {
    "none"
}

$knowledgeBase = [ordered]@{
    mode = "local_runtime_synthetic"
    publicIdHashPrefix = Get-HashPrefix -Value "knowledge_base:$sourceHashPrefix"
    source = "ignored_rawfiles"
}

$resource = [ordered]@{
    mode = "local_runtime_synthetic"
    publicIdHashPrefix = Get-HashPrefix -Value "resource:$sourceHashPrefix"
    status = "rag_ready"
    extension = $extension
    sourceSizeByte = $selectedSource.Length
    contentHashPrefix = Get-HashPrefix -Value $extractedText
    sourceLocation = "ignored_rawfiles"
}

$chunkSummary = [ordered]@{
    chunkCount = $chunks.Count
    totalCharacterCount = ($chunks | Measure-Object -Property charLength -Sum).Sum
    hashPrefixes = @($chunks | ForEach-Object { $_.hashPrefix })
}

$retrievalSummary = [ordered]@{
    queryHashPrefix = $queryHashPrefix
    citationCount = $citationChunks.Count
    citationHashPrefixes = @($citationChunks | ForEach-Object { $_.hashPrefix })
    evidenceStatus = $evidenceStatus
}

$result = if ($evidenceStatus -eq "none") { "failed" } else { "pass" }

Write-SmokeSummary -Summary @{
    result = $result
    failureClass = if ($result -eq "pass") { $null } else { "no_citation_selected" }
    sourceLocation = "ignored_rawfiles"
    supportedExtension = $extension
    sourceSizeByte = $selectedSource.Length
    sourceHashPrefix = $sourceHashPrefix
    knowledgeBase = $knowledgeBase
    resource = $resource
    chunkSummary = $chunkSummary
    retrievalSummary = $retrievalSummary
    evidenceStatus = $evidenceStatus
}

if ($result -ne "pass") {
    exit 1
}
