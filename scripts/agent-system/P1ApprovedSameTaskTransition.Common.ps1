$script:P1AstScalarKeys = @(
    "schemaVersion", "transitionType", "transitionId", "taskId", "parentTaskId", "baseSha", "branch",
    "authorizationId", "authorizationSource", "standingAuthorizationSource", "statePath", "stateFromSha256",
    "stateToSha256", "queuePath", "queueFromSha256", "queueToSha256", "fileCount", "singleParent",
    "singleCommit", "oneTime", "ancestorCheckpointPolicy", "ordinaryDriftPolicy", "standardModePolicy",
    "databaseExecutionPolicy", "permissionExpansionPolicy"
)
$script:P1AstFenceName = "tiku-approved-same-task-transition-v1"
$script:P1AstEvidenceScalarKeys = @(
    "schemaVersion", "recordType", "taskId", "transitionId", "authorizationId", "authorizationSource",
    "baseSha", "candidateIdentityType", "candidateIdentity", "branch", "stateFromSha256", "stateToSha256",
    "queueFromSha256", "queueToSha256", "reviewDecision", "validationProfile", "freshnessKey", "commandCount",
    "positiveCount", "negativeCount", "validatorSha256", "p1AdapterSha256", "preCommitAdapterSha256",
    "prePushAdapterSha256", "fixtureSha256", "fileCount"
)
$script:P1AstEvidenceFenceName = "tiku-transition-evidence-v1"

function Get-P1AstSha256Text {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)
    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes(($Text -replace "`r`n?", "`n"))
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha256.ComputeHash($bytes))).Replace("-", "").ToLowerInvariant() }
    finally { $sha256.Dispose() }
}

function Add-P1AstCode {
    param([System.Collections.Generic.List[string]]$Codes, [string]$Code)
    if (-not $Codes.Contains($Code)) { $Codes.Add($Code) }
}

function Read-P1ApprovedSameTaskTransitionContract {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$SourcePath
    )
    $codes = [System.Collections.Generic.List[string]]::new()
    $values = [ordered]@{}
    $files = [System.Collections.Generic.List[object]]::new()
    $normalizedSourcePath = $SourcePath.Replace("\", "/")
    $recognized = $normalizedSourcePath.IndexOf("/transitions/", [StringComparison]::OrdinalIgnoreCase) -ge 0 `
        -or $Text.IndexOf($script:P1AstFenceName, [StringComparison]::OrdinalIgnoreCase) -ge 0 `
        -or $Text.IndexOf("approved_same_task_transition", [StringComparison]::OrdinalIgnoreCase) -ge 0

    if ($Text.Contains("`r") -or $Text.IndexOf([char]0xFEFF) -ge 0 -or $Text.IndexOf([char]0xFFFD) -ge 0) {
        Add-P1AstCode $codes "P1_AST_CONTRACT_BLOCK_INVALID"
    }
    $lines = @($Text -split "`n", -1)
    $fence = ([string][char]96) * 3
    $openingFence = $fence + $script:P1AstFenceName
    $openingIndexes = @()
    $fenceIndexes = @()
    for ($lineIndex = 0; $lineIndex -lt $lines.Count; $lineIndex++) {
        if ($lines[$lineIndex] -ceq $openingFence) { $openingIndexes += $lineIndex }
        if ($lines[$lineIndex].StartsWith($fence, [StringComparison]::Ordinal)) { $fenceIndexes += $lineIndex }
    }
    if ($openingIndexes.Count -ne 1 -or $fenceIndexes.Count -ne 2) {
        Add-P1AstCode $codes "P1_AST_CONTRACT_BLOCK_INVALID"
    }
    $bodyLines = @()
    if ($openingIndexes.Count -eq 1 -and $fenceIndexes.Count -eq 2 -and $fenceIndexes[0] -eq $openingIndexes[0] -and $lines[$fenceIndexes[1]] -ceq $fence) {
        if ($fenceIndexes[1] -gt $fenceIndexes[0] + 1) { $bodyLines = @($lines[($fenceIndexes[0] + 1)..($fenceIndexes[1] - 1)]) }
        $beforeBlock = if ($fenceIndexes[0] -gt 0) { @($lines[0..($fenceIndexes[0] - 1)]) } else { @() }
        $afterBlock = if ($fenceIndexes[1] -lt $lines.Count - 1) { @($lines[($fenceIndexes[1] + 1)..($lines.Count - 1)]) } else { @() }
        if (@($beforeBlock | Where-Object { -not [string]::IsNullOrEmpty($_) }).Count -gt 0 `
            -or @($afterBlock | Where-Object { -not [string]::IsNullOrEmpty($_) }).Count -gt 0) {
            Add-P1AstCode $codes "P1_AST_CONTRACT_BLOCK_INVALID"
        }
    }

    $exactKeys = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    $foldedKeys = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach ($line in $bodyLines) {
        if ([string]::IsNullOrEmpty($line) -or $line -cne $line.Trim() -or $line.StartsWith("#", [StringComparison]::Ordinal)) {
            Add-P1AstCode $codes "P1_AST_FIELD_INVALID"
            continue
        }
        $match = [regex]::Match($line, '^([^=]+)=([^=].*)$')
        if (-not $match.Success) { Add-P1AstCode $codes "P1_AST_FIELD_INVALID"; continue }
        $key = $match.Groups[1].Value
        $value = $match.Groups[2].Value
        $isScalar = $script:P1AstScalarKeys -ccontains $key
        $fileMatch = [regex]::Match($key, '^file\.([0-9]{3})\.(path|status)$')
        if (-not $isScalar -and -not $fileMatch.Success) { Add-P1AstCode $codes "P1_AST_FIELD_INVALID"; continue }
        if (-not $exactKeys.Add($key) -or -not $foldedKeys.Add($key)) { Add-P1AstCode $codes "P1_AST_FIELD_INVALID"; continue }
        $values[$key] = $value
    }
    foreach ($requiredKey in $script:P1AstScalarKeys) {
        if (-not $values.Contains($requiredKey)) { Add-P1AstCode $codes "P1_AST_FIELD_INVALID" }
    }
    if ($values.Contains("schemaVersion") -and $values.schemaVersion -cne "1") { Add-P1AstCode $codes "P1_AST_FIELD_INVALID" }
    if ($values.Contains("transitionType") -and $values.transitionType -ine "approved_same_task_transition") { }
    elseif ($values.Contains("transitionType") -and $values.transitionType -cne "approved_same_task_transition") { Add-P1AstCode $codes "P1_AST_FIELD_INVALID" }
    if ($values.Contains("oneTime") -and $values.oneTime -cne "true") { Add-P1AstCode $codes "P1_AST_FIELD_INVALID" }
    if ($values.Contains("databaseExecutionPolicy") -and $values.databaseExecutionPolicy -cne "blocked") { Add-P1AstCode $codes "P1_AST_FIELD_INVALID" }
    if ($values.Contains("permissionExpansionPolicy") -and $values.permissionExpansionPolicy -cne "blocked") { Add-P1AstCode $codes "P1_AST_FIELD_INVALID" }
    if ($values.Contains("baseSha") -and [string]$values.baseSha -cnotmatch '^[0-9a-f]{40}$') { Add-P1AstCode $codes "P1_AST_FIELD_INVALID" }
    foreach ($shaKey in @("stateFromSha256", "stateToSha256", "queueFromSha256", "queueToSha256")) {
        if ($values.Contains($shaKey) -and [string]$values[$shaKey] -cnotmatch '^[0-9a-f]{64}$') { Add-P1AstCode $codes "P1_AST_FIELD_INVALID" }
    }

    $fileCount = -1
    if (-not $values.Contains("fileCount") -or [string]$values.fileCount -cnotmatch '^[1-9][0-9]*$' `
        -or -not [int]::TryParse([string]$values.fileCount, [ref]$fileCount) -or $fileCount -lt 1 -or $fileCount -gt 999) {
        Add-P1AstCode $codes "P1_AST_FIELD_INVALID"
    } else {
        for ($fileIndex = 1; $fileIndex -le $fileCount; $fileIndex++) {
            $indexText = $fileIndex.ToString("000")
            $pathKey = "file.$indexText.path"
            $statusKey = "file.$indexText.status"
            if (-not $values.Contains($pathKey) -or -not $values.Contains($statusKey)) { Add-P1AstCode $codes "P1_AST_FILE_SET_INVALID"; continue }
            $files.Add([pscustomobject]@{ Path = [string]$values[$pathKey]; Status = [string]$values[$statusKey] })
            if ([string]$values[$statusKey] -cnotin @("A", "M")) { Add-P1AstCode $codes "P1_AST_FILE_SET_INVALID" }
        }
        $indexedKeyCount = @($values.Keys | Where-Object { $_ -match '^file\.[0-9]{3}\.(path|status)$' }).Count
        if ($indexedKeyCount -ne ($fileCount * 2)) { Add-P1AstCode $codes "P1_AST_FILE_SET_INVALID" }
    }
    return [pscustomobject]@{
        Recognized = [bool]$recognized
        ParserValid = $codes.Count -eq 0
        FindingCodes = @($codes)
        Values = $values
        Files = @($files)
        SourcePath = $normalizedSourcePath
        RawText = $Text
    }
}

function Get-P1ApprovedSameTaskTransitionCanonicalFiles {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$NameStatusRecords)
    if ($NameStatusRecords.Count -gt 999) { throw "P1 approved same-task transition file records exceed maximum 999." }
    $result = [System.Collections.Generic.List[object]]::new()
    for ($recordIndex = 0; $recordIndex -lt $NameStatusRecords.Count; $recordIndex++) {
        $record = $NameStatusRecords[$recordIndex]
        if ($record -is [string]) {
            $match = [regex]::Match([string]$record, '^([^\t]+)\t(.+)$')
            if (-not $match.Success) { $result.Add([pscustomobject]@{ Path = ""; Status = "INVALID"; Raw = [string]$record; OriginalIndex = $recordIndex }); continue }
            $result.Add([pscustomobject]@{ Path = $match.Groups[2].Value; Status = $match.Groups[1].Value; Raw = [string]$record; OriginalIndex = $recordIndex })
        } else {
            $result.Add([pscustomobject]@{ Path = [string]$record.Path; Status = [string]$record.Status; Raw = $record; OriginalIndex = $recordIndex })
        }
    }
    $sorted = @($result)
    for ($index = 1; $index -lt $sorted.Count; $index++) {
        $candidate = $sorted[$index]
        $cursor = $index - 1
        while ($cursor -ge 0) {
            $comparison = [string]::CompareOrdinal([string]$sorted[$cursor].Path, [string]$candidate.Path)
            if ($comparison -eq 0) { $comparison = [string]::CompareOrdinal([string]$sorted[$cursor].Status, [string]$candidate.Status) }
            if ($comparison -le 0) { break }
            $sorted[$cursor + 1] = $sorted[$cursor]
            $cursor--
        }
        $sorted[$cursor + 1] = $candidate
    }
    return @($sorted)
}

function Invoke-P1AstGitCapture {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Arguments
    )

    if ($RepositoryRoot.Contains('"')) { throw "P1_AST_PRE_COMMIT_NAME_STATUS_GIT_FAILED repository_root" }
    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = "git.exe"
    $startInfo.Arguments = '-C "' + $RepositoryRoot + '" ' + $Arguments
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.StandardOutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $startInfo.StandardErrorEncoding = [System.Text.UTF8Encoding]::new($false)
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        [void]$process.Start()
        $standardOutputTask = $process.StandardOutput.ReadToEndAsync()
        $standardErrorTask = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        return [pscustomobject]@{
            ExitCode = $process.ExitCode
            StandardOutput = ($standardOutputTask.GetAwaiter().GetResult() -replace "`r`n?", "`n")
            StandardError = ($standardErrorTask.GetAwaiter().GetResult() -replace "`r`n?", "`n")
        }
    } finally { $process.Dispose() }
}

function Get-P1ApprovedSameTaskTransitionPreCommitNameStatus {
    param([Parameter(Mandatory = $true)][string]$RepositoryRoot)

    $headInspection = Invoke-P1AstGitCapture -RepositoryRoot $RepositoryRoot -Arguments 'rev-parse --verify --quiet "HEAD^{commit}"'
    if ($headInspection.ExitCode -notin @(0, 1) -or -not [string]::IsNullOrEmpty($headInspection.StandardError)) {
        throw "P1_AST_PRE_COMMIT_NAME_STATUS_GIT_FAILED head_inspection exit=$($headInspection.ExitCode) stderr=$($headInspection.StandardError.Trim())"
    }

    $hasHead = $headInspection.ExitCode -eq 0
    if ($hasHead) {
        $headSha = $headInspection.StandardOutput.Trim()
        if ($headSha -cnotmatch '^(?:[0-9a-f]{40}|[0-9a-f]{64})$') {
            throw "P1_AST_PRE_COMMIT_NAME_STATUS_GIT_FAILED head_identity"
        }
    } elseif (-not [string]::IsNullOrEmpty($headInspection.StandardOutput)) {
        throw "P1_AST_PRE_COMMIT_NAME_STATUS_GIT_FAILED unborn_identity"
    }

    $diffArguments = if ($hasHead) {
        'diff --cached --name-status --no-renames HEAD --'
    } else {
        'diff --cached --name-status --no-renames --'
    }
    $nameStatusInspection = Invoke-P1AstGitCapture -RepositoryRoot $RepositoryRoot -Arguments $diffArguments
    if ($nameStatusInspection.ExitCode -ne 0 -or -not [string]::IsNullOrEmpty($nameStatusInspection.StandardError)) {
        throw "P1_AST_PRE_COMMIT_NAME_STATUS_GIT_FAILED diff_cached exit=$($nameStatusInspection.ExitCode) stderr=$($nameStatusInspection.StandardError.Trim())"
    }
    if ([string]::IsNullOrEmpty($nameStatusInspection.StandardOutput)) { return @() }
    return @(($nameStatusInspection.StandardOutput.TrimEnd([char]10)).Split([char]10))
}

function Select-P1ApprovedSameTaskTransitionHistoricalExactRoute {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$NameStatusRecords,
        [Parameter(Mandatory = $true)][System.Collections.IDictionary]$HistoricalRoutes
    )
    if ($NameStatusRecords.Count -gt 999 -or $HistoricalRoutes.Count -gt 32) {
        throw "P1 historical exact-route input exceeds its bounded size."
    }
    $rawRecordsValid = $true
    foreach ($nameStatusRecord in $NameStatusRecords) {
        if ($nameStatusRecord -isnot [string] -or [string]$nameStatusRecord -cnotmatch '^[AM]\t[^\t]+$') {
            $rawRecordsValid = $false
            break
        }
    }
    $canonicalFiles = if ($rawRecordsValid) {
        @(Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords $NameStatusRecords)
    } else { @() }
    $actualPaths = [System.Collections.Generic.List[string]]::new()
    $actualUniquePaths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
    foreach ($canonicalFile in $canonicalFiles) {
        $actualPath = [string]$canonicalFile.Path
        if (-not $actualUniquePaths.Add($actualPath)) { $rawRecordsValid = $false }
        $actualPaths.Add($actualPath)
    }
    if (-not $rawRecordsValid -or $actualPaths.Count -ne $NameStatusRecords.Count) {
        return [pscustomobject]@{ Claimed = $false; Name = "" }
    }
    $matches = [System.Collections.Generic.List[string]]::new()
    foreach ($routeName in $HistoricalRoutes.Keys) {
        if ([string]::IsNullOrWhiteSpace([string]$routeName)) { throw "P1 historical exact-route name is empty." }
        $expectedFilesRaw = @($HistoricalRoutes[$routeName])
        if ($expectedFilesRaw.Count -gt 999) { throw "P1 historical exact-route file set exceeds maximum 999: $routeName" }
        $expectedFiles = @(Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords @($expectedFilesRaw | ForEach-Object { "A`t$([string]$_)" }))
        $expectedPaths = @($expectedFiles | ForEach-Object { [string]$_.Path })
        $expectedUniquePaths = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
        foreach ($expectedPath in $expectedPaths) { $null = $expectedUniquePaths.Add($expectedPath) }
        if ($actualPaths.Count -eq $expectedFilesRaw.Count `
            -and $expectedUniquePaths.Count -eq $expectedFilesRaw.Count `
            -and ($actualPaths -join "|") -ceq ($expectedPaths -join "|")) {
            $matches.Add([string]$routeName)
        }
    }
    if ($matches.Count -gt 1) { throw "P1 historical exact-route configuration is ambiguous: $($matches -join ',')" }
    return [pscustomobject]@{
        Claimed = $matches.Count -eq 1
        Name = if ($matches.Count -eq 1) { $matches[0] } else { "" }
    }
}

function Test-P1AstCandidatePath {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Path)
    if ([string]::IsNullOrWhiteSpace($Path) -or $Path -match '[\x00-\x1f]' -or $Path.Contains("\") `
        -or $Path.StartsWith("/", [StringComparison]::Ordinal) -or $Path -match '^[A-Za-z]:' `
        -or $Path -match '(^|/)\.\.?(/|$)') { return $false }
    if ($Path -match '^(AGENTS\.md|package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|npm-shrinkwrap\.json|\.env(?:\.|$)|\.husky(?:/|$)|(?:src|tests|e2e|drizzle|migrations|seed)(?:/|$))') { return $false }
    return $true
}

function Test-P1AstIntegerValue {
    param($Value)
    if ($null -eq $Value) { return $false }
    return $Value.GetType().FullName -cin @(
        "System.SByte", "System.Byte", "System.Int16", "System.UInt16", "System.Int32", "System.UInt32", "System.Int64", "System.UInt64"
    )
}

function Get-P1AstOrdinalDictionaryEntry {
    param(
        [Parameter(Mandatory = $true)][System.Collections.IDictionary]$Dictionary,
        [Parameter(Mandatory = $true)][string]$Key
    )
    foreach ($candidateKey in $Dictionary.Keys) {
        if ([string]$candidateKey -ceq $Key) {
            return [pscustomobject]@{ Found = $true; Value = $Dictionary[$candidateKey] }
        }
    }
    return [pscustomobject]@{ Found = $false; Value = $null }
}

function Get-P1AstFactText {
    param([System.Collections.IDictionary]$Facts, [string]$Key)
    $entry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key $Key
    if ($entry.Found) { return [string]$entry.Value }
    return ""
}

function Get-P1AstNormalizedMachineEvidenceText {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)
    $lines = @(($Text -replace "`r`n?", "`n").Split([char]10))
    $openingFence = (([string][char]96) * 3) + $script:P1AstEvidenceFenceName
    $openingIndexes = @()
    for ($lineIndex = 0; $lineIndex -lt $lines.Count; $lineIndex++) {
        if ($lines[$lineIndex] -ceq $openingFence) { $openingIndexes += $lineIndex }
    }
    if ($openingIndexes.Count -ne 1) { return ($lines -join "`n") }
    $closingFence = ([string][char]96) * 3
    $closingIndex = -1
    for ($lineIndex = $openingIndexes[0] + 1; $lineIndex -lt $lines.Count; $lineIndex++) {
        if ($lines[$lineIndex] -ceq $closingFence) { $closingIndex = $lineIndex; break }
    }
    if ($closingIndex -lt 0) { return ($lines -join "`n") }
    for ($lineIndex = $openingIndexes[0] + 1; $lineIndex -lt $closingIndex; $lineIndex++) {
        if ($lines[$lineIndex] -match '^(candidateIdentity|freshnessKey)=') {
            $lines[$lineIndex] = $matches[1] + "="
        }
    }
    return ($lines -join "`n")
}

function Get-P1ApprovedSameTaskTransitionCandidateTreeHash {
    param([Parameter(Mandatory = $true)][System.Collections.IDictionary]$Facts)
    $nameStatusEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "NameStatusRecords"
    $hashMapEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "CandidateFileSha256ByPath"
    $textMapEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "CandidateFileTextByPath"
    if ($nameStatusEntry.Found -and $nameStatusEntry.Value -is [System.Collections.IList] -and $nameStatusEntry.Value.Count -gt 999) {
        throw "P1 approved same-task transition file records exceed maximum 999."
    }
    if ($hashMapEntry.Found -and $hashMapEntry.Value -is [System.Collections.IDictionary] -and $hashMapEntry.Value.Count -gt 999) {
        throw "P1 approved same-task transition file hashes exceed maximum 999."
    }
    if ($textMapEntry.Found -and $textMapEntry.Value -is [System.Collections.IDictionary] -and $textMapEntry.Value.Count -gt 999) {
        throw "P1 approved same-task transition file texts exceed maximum 999."
    }
    $files = if ($nameStatusEntry.Found -and $nameStatusEntry.Value -is [System.Collections.IList] -and $nameStatusEntry.Value -isnot [string]) {
        @(Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords @($nameStatusEntry.Value))
    } else { @() }
    $hashMap = if ($hashMapEntry.Found) { $hashMapEntry.Value } else { $null }
    $textMap = if ($textMapEntry.Found) { $textMapEntry.Value } else { $null }
    $machineEvidenceSourcePath = Get-P1AstFactText $Facts "MachineEvidenceSourcePath"
    $records = [System.Collections.Generic.List[string]]::new()
    foreach ($file in $files) {
        $fileHash = ""
        $textEntry = if ($textMap -is [System.Collections.IDictionary]) { Get-P1AstOrdinalDictionaryEntry -Dictionary $textMap -Key ([string]$file.Path) } else { [pscustomobject]@{ Found = $false; Value = $null } }
        if ($textEntry.Found) {
            $fileText = [string]$textEntry.Value
            if (-not [string]::IsNullOrWhiteSpace($machineEvidenceSourcePath) -and [string]$file.Path -ceq $machineEvidenceSourcePath) {
                $fileText = Get-P1AstNormalizedMachineEvidenceText $fileText
            }
            $fileHash = Get-P1AstSha256Text $fileText
        } elseif ($hashMap -is [System.Collections.IDictionary]) {
            $hashEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $hashMap -Key ([string]$file.Path)
            if ($hashEntry.Found) { $fileHash = [string]$hashEntry.Value }
        }
        $records.Add(("{0}:{1}{2}:{3}{4}:{5}" -f ([string]$file.Status).Length, $file.Status, ([string]$file.Path).Length, $file.Path, $fileHash.Length, $fileHash))
    }
    $canonicalText = "p1-ast-candidate-tree-v1`ncount=$($files.Count)`n" + (($records -join "`n") + "`n")
    return Get-P1AstSha256Text $canonicalText
}

function Get-P1ApprovedSameTaskTransitionFreshnessKey {
    param(
        [Parameter(Mandatory = $true)][System.Collections.IDictionary]$Facts,
        [Parameter(Mandatory = $true)][string]$Profile,
        [Parameter(Mandatory = $true)][string]$Command
    )
    $candidateIdentityType = Get-P1AstFactText $Facts "CandidateIdentityType"
    $candidate = if ($candidateIdentityType -ceq "commit_sha") { Get-P1AstFactText $Facts "CandidateCommitSha" } else { Get-P1ApprovedSameTaskTransitionCandidateTreeHash $Facts }
    $freshnessText = @(
        "candidateIdentity=$candidate"
        "baseSha=$(Get-P1AstFactText $Facts 'BaseSha')"
        "schemaVersion=$(Get-P1AstFactText $Facts 'SchemaVersion')"
        "commonSha256=$(Get-P1AstFactText $Facts 'CommonSha256')"
        "p1AdapterSha256=$(Get-P1AstFactText $Facts 'P1AdapterSha256')"
        "preCommitAdapterSha256=$(Get-P1AstFactText $Facts 'PreCommitAdapterSha256')"
        "prePushAdapterSha256=$(Get-P1AstFactText $Facts 'PrePushAdapterSha256')"
        "fixtureSha256=$(Get-P1AstFactText $Facts 'FixtureSha256')"
        "stateProjectionSha256=$(Get-P1AstFactText $Facts 'StateProjectionSha256')"
        "queueProjectionSha256=$(Get-P1AstFactText $Facts 'QueueProjectionSha256')"
        "profile=$Profile"
        "command=$Command"
    ) -join "`n"
    return Get-P1AstSha256Text ($freshnessText + "`n")
}

function Select-P1ApprovedSameTaskTransitionValidationProfile {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$ChangedFiles,
        [Parameter(Mandatory = $true)][bool]$CodeFrozen
    )
    if ($ChangedFiles.Count -eq 0) { throw "P1 approved same-task transition profile selection requires changed files." }
    $normalizedFiles = @($ChangedFiles | ForEach-Object { ([string]$_).Replace("\", "/") })
    $hasBehaviorChange = @($normalizedFiles | Where-Object {
            $_ -cmatch '^scripts/agent-system/.+\.ps1$' `
                -or $_ -ceq 'docs/04-agent-system/state/p1-approved-same-task-transition-schema-v1.yaml'
        }).Count -gt 0
    if ($hasBehaviorChange) { return $(if ($CodeFrozen) { "full" } else { "focused" }) }

    $contractInstanceFiles = @($normalizedFiles | Where-Object {
            $_ -ceq 'docs/04-agent-system/state/project-state.yaml' `
                -or $_ -ceq 'docs/04-agent-system/state/task-queue.yaml' `
                -or $_ -cmatch '^docs/05-execution-logs/transitions/.+\.md$'
        })
    $hasTransitionContract = @($normalizedFiles | Where-Object { $_ -cmatch '^docs/05-execution-logs/transitions/.+\.md$' }).Count -gt 0
    if ($hasTransitionContract -and $contractInstanceFiles.Count -eq $normalizedFiles.Count) { return "contract-instance-only" }

    if (@($normalizedFiles | Where-Object { $_ -cnotmatch '^docs/' }).Count -eq 0 `
        -and $contractInstanceFiles.Count -eq 0) { return "docs-only" }
    throw "P1 approved same-task transition changed files do not match a validation profile."
}

function Test-P1ApprovedSameTaskTransition {
    param(
        [Parameter(Mandatory = $true)]$Contract,
        [Parameter(Mandatory = $true)][System.Collections.IDictionary]$Facts
    )
    $codes = [System.Collections.Generic.List[string]]::new()
    foreach ($code in @($Contract.FindingCodes)) { Add-P1AstCode $codes $code }
    $values = $Contract.Values
    $typedBooleanFacts = @{}
    foreach ($booleanFact in @(
        @{ Key = "BaseAuthorizationPresent"; Code = "P1_AST_AUTHORIZATION_INVALID" },
        @{ Key = "StandingAuthorizationPresent"; Code = "P1_AST_AUTHORIZATION_INVALID" },
        @{ Key = "StateProjectionMatches"; Code = "P1_AST_PROJECTION_INVALID" },
        @{ Key = "QueueProjectionMatches"; Code = "P1_AST_PROJECTION_INVALID" },
        @{ Key = "SingleParent"; Code = "P1_AST_TOPOLOGY_INVALID" },
        @{ Key = "SingleCommit"; Code = "P1_AST_TOPOLOGY_INVALID" },
        @{ Key = "AncestorMatches"; Code = "P1_AST_TOPOLOGY_INVALID" },
        @{ Key = "RemoteBaselineMatches"; Code = "P1_AST_TOPOLOGY_INVALID" },
        @{ Key = "AncestorCheckpointAuthorized"; Code = "P1_AST_TOPOLOGY_INVALID" },
        @{ Key = "TransitionConsumed"; Code = "P1_AST_REPLAY_BLOCKED" },
        @{ Key = "OrdinaryDrift"; Code = "P1_AST_ORDINARY_DRIFT_BLOCKED" },
        @{ Key = "StandardMode"; Code = "P1_AST_STANDARD_MODE_BLOCKED" },
        @{ Key = "CandidateAuthorizationPresent"; Code = "P1_AST_AUTHORIZATION_INVALID" },
        @{ Key = "CandidateStatusApproved"; Code = "P1_AST_AUTHORIZATION_INVALID" },
        @{ Key = "CandidateCloseoutPolicyAuthorization"; Code = "P1_AST_AUTHORIZATION_INVALID" },
        @{ Key = "CandidateProjectionPresent"; Code = "P1_AST_PROJECTION_INVALID" },
        @{ Key = "ReservedMarkerPresent"; Code = "P1_AST_CONTEXT_INVALID" }
    )) {
        $booleanEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key $booleanFact.Key
        if (-not $booleanEntry.Found -or $booleanEntry.Value -isnot [bool]) {
            Add-P1AstCode $codes $booleanFact.Code
            $typedBooleanFacts[$booleanFact.Key] = $false
        } else {
            $typedBooleanFacts[$booleanFact.Key] = [bool]$booleanEntry.Value
        }
    }
    $parentCountEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "ParentCount"
    $commitCountEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "CommitCount"
    if (-not $parentCountEntry.Found -or -not (Test-P1AstIntegerValue $parentCountEntry.Value) `
        -or -not $commitCountEntry.Found -or -not (Test-P1AstIntegerValue $commitCountEntry.Value)) {
        Add-P1AstCode $codes "P1_AST_TOPOLOGY_INVALID"
    }
    $parentCount = if ($parentCountEntry.Found -and (Test-P1AstIntegerValue $parentCountEntry.Value)) { [decimal]$parentCountEntry.Value } else { 0 }
    $commitCount = if ($commitCountEntry.Found -and (Test-P1AstIntegerValue $commitCountEntry.Value)) { [decimal]$commitCountEntry.Value } else { 0 }
    $recognized = [bool]$Contract.Recognized -or $typedBooleanFacts.ReservedMarkerPresent -or $typedBooleanFacts.CandidateProjectionPresent

    if ($values.Contains("transitionType") -and $values.transitionType -cne "approved_same_task_transition" -and $values.transitionType -ieq "approved_same_task_transition") {
        Add-P1AstCode $codes "P1_AST_FIELD_INVALID"
    } elseif ($values.Contains("transitionType") -and $values.transitionType -cne "approved_same_task_transition") { Add-P1AstCode $codes "P1_AST_CONTEXT_INVALID" }
    foreach ($context in @(
        @{ Key = "transitionId"; Fact = "TransitionId" }, @{ Key = "taskId"; Fact = "TaskId" },
        @{ Key = "parentTaskId"; Fact = "ParentTaskId" }, @{ Key = "baseSha"; Fact = "BaseSha" }, @{ Key = "branch"; Fact = "Branch" }
    )) {
        if ($values.Contains($context.Key) -and [string]$values[$context.Key] -cne [string]$Facts[$context.Fact]) { Add-P1AstCode $codes "P1_AST_CONTEXT_INVALID" }
    }
    if (-not $typedBooleanFacts.BaseAuthorizationPresent -or -not $typedBooleanFacts.StandingAuthorizationPresent `
        -or $typedBooleanFacts.CandidateAuthorizationPresent -or $typedBooleanFacts.CandidateStatusApproved -or $typedBooleanFacts.CandidateCloseoutPolicyAuthorization `
        -or ($values.Contains("authorizationId") -and [string]$values.authorizationId -cne [string]$Facts.BaseAuthorizationId) `
        -or ($values.Contains("authorizationSource") -and [string]$values.authorizationSource -cne [string]$Facts.BaseAuthorizationSource) `
        -or ($values.Contains("standingAuthorizationSource") -and [string]$values.standingAuthorizationSource -cne [string]$Facts.BaseStandingAuthorizationSource)) {
        Add-P1AstCode $codes "P1_AST_AUTHORIZATION_INVALID"
    }
    foreach ($projection in @(
        @{ Key = "statePath"; Fact = "StatePath" }, @{ Key = "stateFromSha256"; Fact = "StateFromSha256" }, @{ Key = "stateToSha256"; Fact = "StateToSha256" },
        @{ Key = "queuePath"; Fact = "QueuePath" }, @{ Key = "queueFromSha256"; Fact = "QueueFromSha256" }, @{ Key = "queueToSha256"; Fact = "QueueToSha256" }
    )) {
        if ($values.Contains($projection.Key) -and [string]$values[$projection.Key] -cne [string]$Facts[$projection.Fact]) { Add-P1AstCode $codes "P1_AST_PROJECTION_INVALID" }
    }
    if (-not $typedBooleanFacts.StateProjectionMatches -or -not $typedBooleanFacts.QueueProjectionMatches) { Add-P1AstCode $codes "P1_AST_PROJECTION_INVALID" }

    $nameStatusEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "NameStatusRecords"
    $expectedNameStatusEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "ExpectedNameStatusRecords"
    $nameStatusTypeValid = $nameStatusEntry.Found -and $nameStatusEntry.Value -is [System.Collections.IList] -and $nameStatusEntry.Value -isnot [string]
    $expectedNameStatusTypeValid = $expectedNameStatusEntry.Found -and $expectedNameStatusEntry.Value -is [System.Collections.IList] -and $expectedNameStatusEntry.Value -isnot [string]
    $contractFilesRaw = @($Contract.Files)
    $nameStatusWithinLimit = $nameStatusTypeValid -and $nameStatusEntry.Value.Count -le 999
    $expectedNameStatusWithinLimit = $expectedNameStatusTypeValid -and $expectedNameStatusEntry.Value.Count -le 999
    $contractFilesWithinLimit = $contractFilesRaw.Count -le 999
    $candidateFileHashPreflightEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "CandidateFileSha256ByPath"
    $candidateFileHashesWithinLimit = $candidateFileHashPreflightEntry.Found -and $candidateFileHashPreflightEntry.Value -is [System.Collections.IDictionary] `
        -and $candidateFileHashPreflightEntry.Value.Count -le 999
    $actualFiles = if ($nameStatusWithinLimit) { @(Get-P1ApprovedSameTaskTransitionCanonicalFiles @($nameStatusEntry.Value)) } else { @() }
    $expectedFiles = if ($expectedNameStatusWithinLimit) { @(Get-P1ApprovedSameTaskTransitionCanonicalFiles @($expectedNameStatusEntry.Value)) } else { @() }
    $contractFiles = if ($contractFilesWithinLimit) { @(Get-P1ApprovedSameTaskTransitionCanonicalFiles $contractFilesRaw) } else { @() }
    $fileSetValid = $nameStatusWithinLimit -and $expectedNameStatusWithinLimit -and $contractFilesWithinLimit -and $candidateFileHashesWithinLimit `
        -and $actualFiles.Count -eq $contractFiles.Count -and $actualFiles.Count -eq $expectedFiles.Count
    $actualUnique = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach ($fileList in @(@($actualFiles), @($contractFiles), @($expectedFiles))) {
        for ($index = 0; $index -lt $fileList.Count; $index++) {
            $file = $fileList[$index]
            if ($file.OriginalIndex -ne $index -or $file.Status -cnotin @("A", "M") -or -not (Test-P1AstCandidatePath ([string]$file.Path))) { $fileSetValid = $false }
        }
    }
    for ($index = 0; $index -lt $actualFiles.Count; $index++) {
        $file = $actualFiles[$index]
        if (-not $actualUnique.Add([string]$file.Path)) { $fileSetValid = $false }
        if ($index -ge $contractFiles.Count -or $index -ge $expectedFiles.Count `
            -or $file.Path -cne $contractFiles[$index].Path -or $file.Status -cne $contractFiles[$index].Status `
            -or $file.Path -cne $expectedFiles[$index].Path -or $file.Status -cne $expectedFiles[$index].Status) { $fileSetValid = $false }
    }
    $requiredRolePaths = @([string]$Facts.StatePath, [string]$Facts.QueuePath, [string]$Contract.SourcePath)
    $requiredRoleSet = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach ($requiredRolePath in $requiredRolePaths) {
        if ([string]::IsNullOrWhiteSpace($requiredRolePath) -or -not $requiredRoleSet.Add($requiredRolePath) -or -not $actualUnique.Contains($requiredRolePath)) {
            $fileSetValid = $false
        }
    }
    $candidateFileHashEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "CandidateFileSha256ByPath"
    $candidateFileHashes = if ($candidateFileHashEntry.Found) { $candidateFileHashEntry.Value } else { $null }
    if (-not $candidateFileHashEntry.Found -or $candidateFileHashes -isnot [System.Collections.IDictionary] -or $candidateFileHashes.Count -ne $actualFiles.Count) {
        $fileSetValid = $false
    } else {
        foreach ($file in $actualFiles) {
            $hashEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $candidateFileHashes -Key ([string]$file.Path)
            if (-not $hashEntry.Found -or [string]$hashEntry.Value -cnotmatch '^[0-9a-f]{64}$') { $fileSetValid = $false }
        }
        $contractSourceHashEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $candidateFileHashes -Key ([string]$Contract.SourcePath)
        $contractRawSha256 = Get-P1AstSha256Text ([string]$Contract.RawText)
        if (-not $contractSourceHashEntry.Found -or [string]$contractSourceHashEntry.Value -cne $contractRawSha256) { $fileSetValid = $false }
        foreach ($projectionHashBinding in @(
            @{ PathFact = "StatePath"; ToFact = "StateToSha256" },
            @{ PathFact = "QueuePath"; ToFact = "QueueToSha256" }
        )) {
            $pathFactEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key $projectionHashBinding.PathFact
            $toFactEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key $projectionHashBinding.ToFact
            $candidateHashEntry = if ($pathFactEntry.Found) {
                Get-P1AstOrdinalDictionaryEntry -Dictionary $candidateFileHashes -Key ([string]$pathFactEntry.Value)
            } else { [pscustomobject]@{ Found = $false; Value = $null } }
            if (-not $pathFactEntry.Found -or -not $toFactEntry.Found -or [string]$toFactEntry.Value -cnotmatch '^[0-9a-f]{64}$' `
                -or -not $candidateHashEntry.Found -or [string]$candidateHashEntry.Value -cne [string]$toFactEntry.Value) {
                Add-P1AstCode $codes "P1_AST_PROJECTION_INVALID"
            }
        }
    }
    if (-not $fileSetValid) { Add-P1AstCode $codes "P1_AST_FILE_SET_INVALID" }

    if (($values.Contains("ordinaryDriftPolicy") -and $values.ordinaryDriftPolicy -cne "hard_block") -or $typedBooleanFacts.OrdinaryDrift) { Add-P1AstCode $codes "P1_AST_ORDINARY_DRIFT_BLOCKED" }
    if (($values.Contains("standardModePolicy") -and $values.standardModePolicy -cne "hard_block") -or $typedBooleanFacts.StandardMode) { Add-P1AstCode $codes "P1_AST_STANDARD_MODE_BLOCKED" }
    if (($values.Contains("ancestorCheckpointPolicy") -and $values.ancestorCheckpointPolicy -cne "transition_only_exact_one_parent") `
        -or ($values.Contains("singleParent") -and $values.singleParent -cne "true") -or ($values.Contains("singleCommit") -and $values.singleCommit -cne "true") `
        -or -not $typedBooleanFacts.SingleParent -or -not $typedBooleanFacts.SingleCommit -or $parentCount -ne 1 -or $commitCount -ne 1 `
        -or -not $typedBooleanFacts.AncestorMatches -or -not $typedBooleanFacts.RemoteBaselineMatches -or -not $typedBooleanFacts.AncestorCheckpointAuthorized) {
        Add-P1AstCode $codes "P1_AST_TOPOLOGY_INVALID"
    }
    if ($typedBooleanFacts.TransitionConsumed) { Add-P1AstCode $codes "P1_AST_REPLAY_BLOCKED" }

    $valid = $recognized -and $codes.Count -eq 0
    $candidateIdentity = if ($nameStatusWithinLimit -and $candidateFileHashesWithinLimit) {
        Get-P1ApprovedSameTaskTransitionCandidateTreeHash $Facts
    } else { "" }
    return [pscustomobject]@{
        Recognized = $recognized
        Valid = $valid
        Mode = if ($valid) { "transition_only" } else { "invalid" }
        TransitionId = if ($values.Contains("transitionId")) { [string]$values.transitionId } else { "" }
        CandidateIdentity = $candidateIdentity
        BaseSha = if ($values.Contains("baseSha")) { [string]$values.baseSha } else { "" }
        NormalizedFiles = @($actualFiles)
        FindingCodes = @($codes)
        FreshnessInputs = [ordered]@{ CandidateIdentity = $candidateIdentity; BaseSha = [string]$Facts.BaseSha }
        Facts = $Facts
    }
}

function Get-P1AstGitText {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Reference,
        [Parameter(Mandatory = $true)][string]$Path
    )
    $spec = if ($Reference -ceq ":") { ":$Path" } else { "${Reference}:$Path" }
    $startInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $startInfo.FileName = "git.exe"
    $startInfo.Arguments = '-C "' + $RepositoryRoot.Replace('"', '\"') + '" show "' + $spec.Replace('"', '\"') + '"'
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.StandardOutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $startInfo
    try {
        [void]$process.Start()
        $content = $process.StandardOutput.ReadToEnd()
        [void]$process.StandardError.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { return "" }
        return $content -replace "`r`n?", "`n"
    } finally { $process.Dispose() }
}

function Test-P1AstBaseTransitionIdentityConsumed {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Reference,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$TransitionId
    )

    if ([string]::IsNullOrWhiteSpace($Reference) -or [string]::IsNullOrWhiteSpace($TransitionId)) { return $true }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $baseTransitionPaths = @()
    $gitExitCode = 1
    try {
        $baseTransitionPaths = @(& git -C $RepositoryRoot ls-tree -r --name-only $Reference -- "docs/05-execution-logs/transitions" 2>$null)
        $gitExitCode = $LASTEXITCODE
    } catch {
        $gitExitCode = 1
    } finally { $ErrorActionPreference = $previousErrorActionPreference }

    if ($gitExitCode -ne 0) { return $true }
    foreach ($path in $baseTransitionPaths) {
        $normalizedPath = ([string]$path).Replace("\", "/")
        if ($normalizedPath -cmatch '^docs/05-execution-logs/transitions/.+\.md$' `
            -and [IO.Path]::GetFileNameWithoutExtension($normalizedPath) -ceq $TransitionId) {
            return $true
        }
    }
    return $false
}

function Test-P1AstMechanismBootstrapFileSet {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

    $expectedFiles = @(
        "docs/04-agent-system/operating-manual.md",
        "docs/04-agent-system/sop/p1-approved-same-task-transition.md",
        "docs/04-agent-system/state/mechanism-source-of-truth-index.yaml",
        "docs/04-agent-system/state/p1-approved-same-task-transition-schema-v1.yaml",
        "docs/04-agent-system/state/project-state.yaml",
        "docs/04-agent-system/state/task-queue.yaml",
        "docs/05-execution-logs/acceptance/2026-07-19-p1-mechanism-execution-compatibility-v2-1-authorization.md",
        "docs/05-execution-logs/task-plans/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
        "docs/05-execution-logs/evidence/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
        "docs/05-execution-logs/audits-reviews/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md",
        "scripts/agent-system/P1ApprovedSameTaskTransition.Common.ps1",
        "scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1",
        "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
        "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
        "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
        "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
    )
    $actual = @($Files | ForEach-Object { ([string]$_).Replace("\", "/") } | Sort-Object -CaseSensitive -Unique)
    $expected = @($expectedFiles | Sort-Object -CaseSensitive -Unique)
    return $Files.Count -eq $expectedFiles.Count -and $actual.Count -eq $expected.Count -and ($actual -join "|") -ceq ($expected -join "|")
}

function Get-P1AstProgramText {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$YamlText)
    $match = [regex]::Match(($YamlText -replace "`r`n?", "`n"), '(?ms)^p1RemediationSerialProgram:\n.*?(?=^[^ \r\n][^:\r\n]*:|\z)')
    if ($match.Success) { return $match.Value }
    return ""
}

function Get-P1AstTaskText {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$QueueText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$TaskId
    )
    if ([string]::IsNullOrWhiteSpace($TaskId)) { return "" }
    $pattern = "(?ms)^  - id: $([regex]::Escape($TaskId))`n.*?(?=^  - id: |^[^ `r`n][^:`r`n]*:|\z)"
    $match = [regex]::Match(($QueueText -replace "`r`n?", "`n"), $pattern)
    if ($match.Success) { return $match.Value }
    return ""
}

function Get-P1AstStateCurrentTaskText {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$StateText)
    $match = [regex]::Match(($StateText -replace "`r`n?", "`n"), '(?ms)^currentTask:\n.*?(?=^\S[^:\r\n]*:|\z)')
    if ($match.Success) { return $match.Value }
    return ""
}

function Get-P1AstYamlScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text,
        [Parameter(Mandatory = $true)][string]$Key
    )
    $match = [regex]::Match($Text, "(?m)^\s+$([regex]::Escape($Key)):\s*([^#\r\n]+?)\s*$")
    if ($match.Success) { return $match.Groups[1].Value.Trim().Trim('"').Trim("'") }
    return ""
}

function Get-P1AstYamlList {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text,
        [Parameter(Mandatory = $true)][string]$Key
    )
    $match = [regex]::Match($Text, "(?ms)^    $([regex]::Escape($Key)):\s*`n(?<items>(?:      - [^`r`n]+`n?)*)")
    if (-not $match.Success) { return @() }
    return @([regex]::Matches($match.Groups['items'].Value, '(?m)^      -\s+([^\r\n]+?)\s*$') | ForEach-Object { $_.Groups[1].Value.Trim().Trim('"').Trim("'") })
}

function Get-P1ApprovedSameTaskTransitionStageInputs {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][ValidateSet("pre_commit", "pre_push")][string]$Phase,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$NameStatusRecords,
        [Parameter(Mandatory = $true)][string]$BaseReference,
        [Parameter(Mandatory = $true)][string]$CandidateReference,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Branch,
        [Parameter(Mandatory = $false)][string]$StatePath = "docs/04-agent-system/state/project-state.yaml",
        [Parameter(Mandatory = $false)][string]$QueuePath = "docs/04-agent-system/state/task-queue.yaml"
    )

    $normalizedRecords = @($NameStatusRecords | ForEach-Object { ([string]$_).Replace("\", "/") })
    $recordObjects = @(Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords $normalizedRecords)
    $transitionRecords = @($recordObjects | Where-Object { $_.Path -match '(?i)^docs/05-execution-logs/transitions/.+\.md$' })
    $rawTransitionPaths = [System.Collections.Generic.List[string]]::new()
    foreach ($rawRecord in $normalizedRecords) {
        $rawFields = @([string]$rawRecord -split "`t", -1)
        for ($rawFieldIndex = 1; $rawFieldIndex -lt $rawFields.Count; $rawFieldIndex++) {
            if ($rawFields[$rawFieldIndex] -match '(?i)^docs/05-execution-logs/transitions/.+\.md$' -and -not $rawTransitionPaths.Contains($rawFields[$rawFieldIndex])) {
                $rawTransitionPaths.Add($rawFields[$rawFieldIndex])
            }
        }
    }
    $candidateFileTextByPath = [ordered]@{}
    $candidateMarkerPresent = $false
    foreach ($record in $recordObjects) {
        if ($record.Status -cin @("A", "M") -and -not $candidateFileTextByPath.Contains([string]$record.Path)) {
            $candidateFileText = Get-P1AstGitText -RepositoryRoot $RepositoryRoot -Reference $CandidateReference -Path ([string]$record.Path)
            $candidateFileTextByPath[[string]$record.Path] = $candidateFileText
            if ($candidateFileText.IndexOf("approved_same_task_transition", [StringComparison]::OrdinalIgnoreCase) -ge 0 `
                -or $candidateFileText.IndexOf("tiku-approved-same-task-transition-v1", [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $candidateMarkerPresent = $true
            }
        }
    }
    $candidateStateText = Get-P1AstGitText -RepositoryRoot $RepositoryRoot -Reference $CandidateReference -Path $StatePath
    $candidateQueueText = Get-P1AstGitText -RepositoryRoot $RepositoryRoot -Reference $CandidateReference -Path $QueuePath
    $candidateProjectionText = $candidateStateText + "`n" + $candidateQueueText
    $projectionMarkerPresent = $candidateProjectionText.IndexOf("approved_same_task_transition", [StringComparison]::OrdinalIgnoreCase) -ge 0 `
        -or $candidateProjectionText.IndexOf("tiku-approved-same-task-transition-v1", [StringComparison]::OrdinalIgnoreCase) -ge 0
    $requested = $rawTransitionPaths.Count -gt 0 -or $projectionMarkerPresent -or $candidateMarkerPresent
    if (-not $requested) {
        return [pscustomobject]@{ Requested = $false; ContractText = ""; SourcePath = ""; Facts = [ordered]@{} }
    }

    $sourcePath = if ($transitionRecords.Count -gt 0) { [string]$transitionRecords[0].Path } elseif ($rawTransitionPaths.Count -gt 0) { [string]$rawTransitionPaths[0] } else { "docs/05-execution-logs/transitions/invalid-reserved-candidate.md" }
    $contractText = if ($transitionRecords.Count -gt 0 -and $transitionRecords[0].Status -cin @("A", "M")) {
        Get-P1AstGitText -RepositoryRoot $RepositoryRoot -Reference $CandidateReference -Path $sourcePath
    } else { "" }
    $contract = Read-P1ApprovedSameTaskTransitionContract -Text $contractText -SourcePath $sourcePath

    $baseSha = ((& git -C $RepositoryRoot rev-parse $BaseReference 2>$null) -join "").Trim()
    if ($LASTEXITCODE -ne 0) { $baseSha = "" }
    $candidateSha = if ($CandidateReference -ceq ":") { "" } else { ((& git -C $RepositoryRoot rev-parse $CandidateReference 2>$null) -join "").Trim() }
    if ($CandidateReference -cne ":" -and $LASTEXITCODE -ne 0) { $candidateSha = "" }
    $baseStateText = if ([string]::IsNullOrEmpty($baseSha)) { "" } else { Get-P1AstGitText -RepositoryRoot $RepositoryRoot -Reference $baseSha -Path $StatePath }
    $baseQueueText = if ([string]::IsNullOrEmpty($baseSha)) { "" } else { Get-P1AstGitText -RepositoryRoot $RepositoryRoot -Reference $baseSha -Path $QueuePath }
    $baseProgramText = Get-P1AstProgramText -YamlText $baseQueueText
    $candidateProgramText = Get-P1AstProgramText -YamlText $candidateStateText
    $baseParentTaskId = Get-P1AstYamlScalar -Text $baseProgramText -Key "currentTaskId"
    $candidateTaskId = Get-P1AstYamlScalar -Text $candidateProgramText -Key "currentTaskId"
    $baseTaskText = Get-P1AstTaskText -QueueText $baseQueueText -TaskId $baseParentTaskId
    $candidateTaskText = Get-P1AstTaskText -QueueText $candidateQueueText -TaskId $candidateTaskId
    $candidateQueueTaskBranch = Get-P1AstYamlScalar -Text $candidateTaskText -Key "branch"
    $candidateStateTaskText = Get-P1AstStateCurrentTaskText -StateText $candidateStateText
    $candidateStateTaskBranch = Get-P1AstYamlScalar -Text $candidateStateTaskText -Key "branch"
    $candidateTaskBranch = if (-not [string]::IsNullOrWhiteSpace($candidateQueueTaskBranch) -and $candidateQueueTaskBranch -ceq $candidateStateTaskBranch) { $candidateQueueTaskBranch } else { "" }
    $baseApprovalId = Get-P1AstYamlScalar -Text $baseTaskText -Key "approvalSource"
    $baseAuthorizationSource = Get-P1AstYamlScalar -Text $baseTaskText -Key "freshApprovalSource"
    if ([string]::IsNullOrWhiteSpace($baseAuthorizationSource)) { $baseAuthorizationSource = Get-P1AstYamlScalar -Text $baseTaskText -Key "authorizationSource" }
    $baseStandingAuthorizationSource = Get-P1AstYamlScalar -Text $baseProgramText -Key "standingAuthorizationSource"
    $baseAllowedFiles = @(Get-P1AstYamlList -Text $baseTaskText -Key "allowedFiles")
    $baseAuthorizationText = if ([string]::IsNullOrWhiteSpace($baseAuthorizationSource)) { "" } else { Get-P1AstGitText -RepositoryRoot $RepositoryRoot -Reference $baseSha -Path $baseAuthorizationSource }
    $baseStandingAuthorizationText = if ([string]::IsNullOrWhiteSpace($baseStandingAuthorizationSource)) { "" } else { Get-P1AstGitText -RepositoryRoot $RepositoryRoot -Reference $baseSha -Path $baseStandingAuthorizationSource }

    $stateFromSha256 = Get-P1AstSha256Text $baseStateText
    $stateToSha256 = Get-P1AstSha256Text $candidateStateText
    $queueFromSha256 = Get-P1AstSha256Text $baseQueueText
    $queueToSha256 = Get-P1AstSha256Text $candidateQueueText
    $candidateFileHashes = [ordered]@{}
    foreach ($record in $recordObjects) {
        if ($record.Status -cin @("A", "M") -and -not $candidateFileHashes.Contains([string]$record.Path)) {
            $candidateFileText = if ($candidateFileTextByPath.Contains([string]$record.Path)) { [string]$candidateFileTextByPath[[string]$record.Path] } else { "" }
            $candidateFileHashes[[string]$record.Path] = Get-P1AstSha256Text $candidateFileText
        }
    }
    $contractStatus = @($transitionRecords | Where-Object { $_.Path -ceq $sourcePath } | Select-Object -First 1).Status
    $expectedRecords = @(
        "M`t$StatePath"
        "M`t$QueuePath"
        "$contractStatus`t$sourcePath"
    )
    $expectedRecords = @((Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords $expectedRecords) | ForEach-Object { "$($_.Status)`t$($_.Path)" })

    $values = $contract.Values
    $transitionId = [IO.Path]::GetFileNameWithoutExtension($sourcePath)
    $baseTransitionIdentityConsumed = Test-P1AstBaseTransitionIdentityConsumed `
        -RepositoryRoot $RepositoryRoot -Reference $baseSha -TransitionId $transitionId
    $authorizationSourceChanged = @($recordObjects | Where-Object { $_.Path -ceq $baseAuthorizationSource }).Count -gt 0
    $candidateStatusApproved = $contractText -match '(?im)^status:\s*approved\s*$'
    $candidateCloseoutAuthorization = -not [string]::IsNullOrWhiteSpace($baseApprovalId) -and $candidateQueueText.Contains("authorizationId: $baseApprovalId")
    $stateProjectionMatches = -not [string]::IsNullOrWhiteSpace($candidateTaskId) -and -not [string]::IsNullOrWhiteSpace($baseParentTaskId) `
        -and $candidateStateText -match "(?m)^\s+currentTaskId:\s*$([regex]::Escape($candidateTaskId))\s*$" `
        -and $candidateStateText -match "(?m)^\s+$([regex]::Escape($baseParentTaskId)):\s*closed\s*$" `
        -and $candidateStateText -match "(?m)^\s+$([regex]::Escape($candidateTaskId)):\s*in_progress\s*$"
    $queueProjectionMatches = -not [string]::IsNullOrWhiteSpace($candidateTaskId) -and -not [string]::IsNullOrWhiteSpace($baseParentTaskId) `
        -and $candidateQueueText -match "(?m)^\s+currentTaskId:\s*$([regex]::Escape($candidateTaskId))\s*$" `
        -and $candidateQueueText -match "(?m)^\s+$([regex]::Escape($baseParentTaskId)):\s*closed\s*$" `
        -and $candidateQueueText -match "(?m)^\s+$([regex]::Escape($candidateTaskId)):\s*in_progress\s*$"

    $parentCount = 1
    $commitCount = 1
    $ancestorMatches = -not [string]::IsNullOrWhiteSpace($baseSha)
    if ($Phase -ceq "pre_push") {
        $parentParts = @(((& git -C $RepositoryRoot rev-list --parents -n 1 $candidateSha 2>$null) -join "").Trim() -split '\s+' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
        $parentCount = [Math]::Max(0, $parentParts.Count - 1)
        $commitText = ((& git -C $RepositoryRoot rev-list --count "$baseSha..$candidateSha" 2>$null) -join "").Trim()
        $parsedCommitCount = 0
        if (-not [int]::TryParse($commitText, [ref]$parsedCommitCount)) { $parsedCommitCount = 0 }
        $commitCount = $parsedCommitCount
        $ancestorMatches = $parentParts.Count -eq 2 -and $parentParts[1] -ceq $baseSha
    }
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try { $remoteSha = ((& git -C $RepositoryRoot rev-parse origin/master 2>$null) -join "").Trim() }
    finally { $ErrorActionPreference = $previousErrorActionPreference }
    if ($LASTEXITCODE -ne 0) { $remoteSha = "" }

    $facts = [ordered]@{
        SourcePath = $sourcePath
        BaseAuthorizationId = $baseApprovalId
        BaseAuthorizationSource = $baseAuthorizationSource
        BaseStandingAuthorizationSource = $baseStandingAuthorizationSource
        Phase = $Phase
        TransitionId = $transitionId
        TaskId = $candidateTaskId
        ParentTaskId = $baseParentTaskId
        BaseSha = $baseSha
        Branch = $candidateTaskBranch
        StatePath = $StatePath
        StateFromSha256 = $stateFromSha256
        StateToSha256 = $stateToSha256
        QueuePath = $QueuePath
        QueueFromSha256 = $queueFromSha256
        QueueToSha256 = $queueToSha256
        BaseAuthorizationPresent = -not [string]::IsNullOrWhiteSpace($baseAuthorizationText) -and $baseAllowedFiles -ccontains $sourcePath
        StandingAuthorizationPresent = -not [string]::IsNullOrWhiteSpace($baseStandingAuthorizationText)
        StateProjectionMatches = [bool]$stateProjectionMatches
        QueueProjectionMatches = [bool]$queueProjectionMatches
        NameStatusRecords = @($normalizedRecords)
        ExpectedNameStatusRecords = @($expectedRecords)
        CandidateFileSha256ByPath = $candidateFileHashes
        SingleParent = $parentCount -eq 1
        SingleCommit = $commitCount -eq 1
        ParentCount = [int]$parentCount
        CommitCount = [int]$commitCount
        AncestorMatches = [bool]$ancestorMatches
        RemoteBaselineMatches = -not [string]::IsNullOrWhiteSpace($remoteSha) -and $remoteSha -ceq $baseSha
        AncestorCheckpointAuthorized = $baseTaskText -match '(?ms)^    closeoutPolicy:\s*.*?^      localCommit:\s*.*?^        approved:\s*true\s*$'
        TransitionConsumed = [bool]($baseTransitionIdentityConsumed -or (-not [string]::IsNullOrWhiteSpace($transitionId) -and (($baseStateText + "`n" + $baseQueueText) -match "(?m)^\s*(?:transitionId:\s*|-\s+)$([regex]::Escape($transitionId))\s*$")))
        OrdinaryDrift = -not [string]::IsNullOrWhiteSpace($candidateTaskId) -and $candidateTaskId -ceq $baseParentTaskId
        StandardMode = $false
        CandidateAuthorizationPresent = [bool]$authorizationSourceChanged
        CandidateStatusApproved = [bool]$candidateStatusApproved
        CandidateCloseoutPolicyAuthorization = [bool]$candidateCloseoutAuthorization
        CandidateProjectionPresent = [bool]$projectionMarkerPresent
        ReservedMarkerPresent = [bool]($candidateMarkerPresent -or $contractText.IndexOf("approved_same_task_transition", [StringComparison]::OrdinalIgnoreCase) -ge 0)
    }
    return [pscustomobject]@{ Requested = $true; ContractText = $contractText; SourcePath = $sourcePath; Facts = $facts }
}

function Read-P1TransitionMachineEvidence {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$SourcePath,
        [System.Collections.IDictionary]$Facts,
        [AllowEmptyString()][string]$Command = ""
    )

    $codes = [System.Collections.Generic.List[string]]::new()
    $values = [ordered]@{}
    $commands = [System.Collections.Generic.List[object]]::new()
    $files = [System.Collections.Generic.List[object]]::new()
    $recognized = $Text.IndexOf($script:P1AstEvidenceFenceName, [StringComparison]::OrdinalIgnoreCase) -ge 0
    if ($Text.Contains("`r") -or $Text.IndexOf([char]0xFEFF) -ge 0 -or $Text.IndexOf([char]0xFFFD) -ge 0) {
        Add-P1AstCode $codes "P1_AST_EVIDENCE_BLOCK_INVALID"
    }

    $lines = @($Text.Split([char]10))
    $fence = ([string][char]96) * 3
    $openingFence = $fence + $script:P1AstEvidenceFenceName
    $reservedOpeningIndexes = @()
    for ($lineIndex = 0; $lineIndex -lt $lines.Count; $lineIndex++) {
        if ($lines[$lineIndex].Equals($openingFence, [StringComparison]::OrdinalIgnoreCase)) { $reservedOpeningIndexes += $lineIndex }
    }
    $openingIndex = if ($reservedOpeningIndexes.Count -eq 1) { $reservedOpeningIndexes[0] } else { -1 }
    if ($reservedOpeningIndexes.Count -ne 1 -or $openingIndex -lt 0 -or $lines[$openingIndex] -cne $openingFence) {
        Add-P1AstCode $codes "P1_AST_EVIDENCE_BLOCK_INVALID"
    }
    $closingIndex = -1
    if ($openingIndex -ge 0) {
        for ($lineIndex = $openingIndex + 1; $lineIndex -lt $lines.Count; $lineIndex++) {
            if ($lines[$lineIndex] -ceq $fence) { $closingIndex = $lineIndex; break }
        }
    }
    if ($closingIndex -lt 0) { Add-P1AstCode $codes "P1_AST_EVIDENCE_BLOCK_INVALID" }

    $bodyLines = if ($openingIndex -ge 0 -and $closingIndex -gt $openingIndex + 1) { @($lines[($openingIndex + 1)..($closingIndex - 1)]) } else { @() }
    $exactKeys = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    $foldedKeys = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach ($line in $bodyLines) {
        if ([string]::IsNullOrEmpty($line) -or $line -cne $line.Trim() -or $line.StartsWith("#", [StringComparison]::Ordinal)) {
            Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID"
            continue
        }
        $match = [regex]::Match($line, '^([^=]+)=([^=].*)$')
        if (-not $match.Success) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID"; continue }
        $key = $match.Groups[1].Value
        $value = $match.Groups[2].Value
        $isScalar = $script:P1AstEvidenceScalarKeys -ccontains $key
        $commandMatch = [regex]::Match($key, '^command\.([0-9]{3})\.(name|exitCode|durationMs)$')
        $fileMatch = [regex]::Match($key, '^file\.([0-9]{3})\.(path|status)$')
        if (-not $isScalar -and -not $commandMatch.Success -and -not $fileMatch.Success) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID"; continue }
        if (-not $exactKeys.Add($key) -or -not $foldedKeys.Add($key)) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID"; continue }
        $values[$key] = $value
    }
    foreach ($requiredKey in $script:P1AstEvidenceScalarKeys) {
        if (-not $values.Contains($requiredKey)) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    }

    if ($values.Contains("schemaVersion") -and [string]$values.schemaVersion -cne "1") { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    if ($values.Contains("recordType") -and [string]$values.recordType -cne "transition_evidence") { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    if ($values.Contains("candidateIdentityType") -and [string]$values.candidateIdentityType -cnotin @("normalized_tree_hash", "commit_sha")) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    if ($values.Contains("validationProfile") -and [string]$values.validationProfile -cnotin @("focused", "full", "contract-instance-only", "docs-only")) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    if ($values.Contains("reviewDecision") -and [string]$values.reviewDecision -cnotin @("APPROVE", "PENDING")) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    foreach ($requiredTextKey in @("taskId", "transitionId", "authorizationId", "authorizationSource", "branch")) {
        if ($values.Contains($requiredTextKey) -and [string]::IsNullOrWhiteSpace([string]$values[$requiredTextKey])) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    }
    if ($values.Contains("baseSha") -and [string]$values.baseSha -cnotmatch '^[0-9a-f]{40}$') { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    foreach ($shaKey in @("stateFromSha256", "stateToSha256", "queueFromSha256", "queueToSha256", "freshnessKey", "validatorSha256", "p1AdapterSha256", "preCommitAdapterSha256", "prePushAdapterSha256", "fixtureSha256")) {
        if ($values.Contains($shaKey) -and [string]$values[$shaKey] -cnotmatch '^[0-9a-f]{64}$') { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    }
    if ($values.Contains("candidateIdentity") -and $values.Contains("candidateIdentityType")) {
        $candidatePattern = if ([string]$values.candidateIdentityType -ceq "commit_sha") { '^[0-9a-f]{40}$' } else { '^[0-9a-f]{64}$' }
        if ([string]$values.candidateIdentity -cnotmatch $candidatePattern) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID" }
    }

    $parsedCounts = @{}
    foreach ($countKey in @("commandCount", "positiveCount", "negativeCount", "fileCount")) {
        $parsedValue = 0L
        if (-not $values.Contains($countKey) -or [string]$values[$countKey] -cnotmatch '^(0|[1-9][0-9]*)$' -or -not [long]::TryParse([string]$values[$countKey], [ref]$parsedValue)) {
            Add-P1AstCode $codes "P1_AST_EVIDENCE_FIELD_INVALID"
            $parsedCounts[$countKey] = -1L
        } else {
            $parsedCounts[$countKey] = $parsedValue
        }
    }

    $commandCount = [long]$parsedCounts.commandCount
    if ($commandCount -lt 0 -or $commandCount -gt 999) {
        Add-P1AstCode $codes "P1_AST_EVIDENCE_COMMAND_SET_INVALID"
    } else {
        for ($commandIndex = 1; $commandIndex -le $commandCount; $commandIndex++) {
            $indexText = $commandIndex.ToString("000")
            $nameKey = "command.$indexText.name"
            $exitCodeKey = "command.$indexText.exitCode"
            $durationKey = "command.$indexText.durationMs"
            if (-not $values.Contains($nameKey) -or -not $values.Contains($exitCodeKey) -or -not $values.Contains($durationKey)) { Add-P1AstCode $codes "P1_AST_EVIDENCE_COMMAND_SET_INVALID"; continue }
            $exitCode = 0L
            $durationMs = 0L
            if ([string]::IsNullOrWhiteSpace([string]$values[$nameKey]) `
                -or [string]$values[$exitCodeKey] -cnotmatch '^(0|[1-9][0-9]*)$' -or -not [long]::TryParse([string]$values[$exitCodeKey], [ref]$exitCode) `
                -or [string]$values[$durationKey] -cnotmatch '^(0|[1-9][0-9]*)$' -or -not [long]::TryParse([string]$values[$durationKey], [ref]$durationMs)) {
                Add-P1AstCode $codes "P1_AST_EVIDENCE_COMMAND_SET_INVALID"
                continue
            }
            $commands.Add([pscustomobject]@{ Name = [string]$values[$nameKey]; ExitCode = $exitCode; DurationMs = $durationMs })
        }
        if (@($values.Keys | Where-Object { $_ -match '^command\.[0-9]{3}\.(name|exitCode|durationMs)$' }).Count -ne ($commandCount * 3)) { Add-P1AstCode $codes "P1_AST_EVIDENCE_COMMAND_SET_INVALID" }
    }

    $fileCount = [long]$parsedCounts.fileCount
    if ($fileCount -lt 0 -or $fileCount -gt 999) {
        Add-P1AstCode $codes "P1_AST_EVIDENCE_FILE_SET_INVALID"
    } else {
        $filePaths = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
        $previousPath = $null
        for ($fileIndex = 1; $fileIndex -le $fileCount; $fileIndex++) {
            $indexText = $fileIndex.ToString("000")
            $pathKey = "file.$indexText.path"
            $statusKey = "file.$indexText.status"
            if (-not $values.Contains($pathKey) -or -not $values.Contains($statusKey)) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FILE_SET_INVALID"; continue }
            $path = [string]$values[$pathKey]
            $status = [string]$values[$statusKey]
            if (-not (Test-P1AstCandidatePath $path) -or $status -cnotin @("A", "M") -or -not $filePaths.Add($path) `
                -or ($null -ne $previousPath -and [string]::CompareOrdinal($previousPath, $path) -ge 0)) {
                Add-P1AstCode $codes "P1_AST_EVIDENCE_FILE_SET_INVALID"
            }
            $previousPath = $path
            $files.Add([pscustomobject]@{ Path = $path; Status = $status })
        }
        if (@($values.Keys | Where-Object { $_ -match '^file\.[0-9]{3}\.(path|status)$' }).Count -ne ($fileCount * 2)) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FILE_SET_INVALID" }
    }

    $parserValid = $codes.Count -eq 0
    if ($parserValid) {
        if ($null -eq $Facts) {
            Add-P1AstCode $codes "P1_AST_EVIDENCE_CONTEXT_INVALID"
        } else {
            $reviewDecisionEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "ReviewDecision"
            $reviewInputKindEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "ReviewInputKind"
            if (-not $reviewDecisionEntry.Found -or $reviewDecisionEntry.Value -isnot [string] `
                -or [string]$reviewDecisionEntry.Value -cnotin @("APPROVE", "PENDING") `
                -or -not $reviewInputKindEntry.Found -or $reviewInputKindEntry.Value -isnot [string] `
                -or [string]$reviewInputKindEntry.Value -cnotin @("production", "synthetic")) {
                Add-P1AstCode $codes "P1_AST_EVIDENCE_CONTEXT_INVALID"
            } elseif ([string]$values.reviewDecision -cne [string]$reviewDecisionEntry.Value `
                -or [string]$reviewDecisionEntry.Value -cne "APPROVE") {
                Add-P1AstCode $codes "P1_AST_EVIDENCE_REVIEW_PENDING"
            }

            foreach ($contextBinding in @(
                @{ Evidence = "schemaVersion"; Fact = "SchemaVersion" },
                @{ Evidence = "taskId"; Fact = "TaskId" },
                @{ Evidence = "transitionId"; Fact = "TransitionId" },
                @{ Evidence = "authorizationId"; Fact = "AuthorizationId" },
                @{ Evidence = "authorizationSource"; Fact = "AuthorizationSource" },
                @{ Evidence = "baseSha"; Fact = "BaseSha" },
                @{ Evidence = "candidateIdentityType"; Fact = "CandidateIdentityType" },
                @{ Evidence = "branch"; Fact = "Branch" },
                @{ Evidence = "stateFromSha256"; Fact = "StateFromSha256" },
                @{ Evidence = "stateToSha256"; Fact = "StateProjectionSha256" },
                @{ Evidence = "queueFromSha256"; Fact = "QueueFromSha256" },
                @{ Evidence = "queueToSha256"; Fact = "QueueProjectionSha256" },
                @{ Evidence = "validationProfile"; Fact = "ValidationProfile" },
                @{ Evidence = "validatorSha256"; Fact = "CommonSha256" },
                @{ Evidence = "p1AdapterSha256"; Fact = "P1AdapterSha256" },
                @{ Evidence = "preCommitAdapterSha256"; Fact = "PreCommitAdapterSha256" },
                @{ Evidence = "prePushAdapterSha256"; Fact = "PrePushAdapterSha256" },
                @{ Evidence = "fixtureSha256"; Fact = "FixtureSha256" }
            )) {
                $contextEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key $contextBinding.Fact
                if (-not $contextEntry.Found -or $contextEntry.Value -isnot [string] `
                    -or [string]$values[$contextBinding.Evidence] -cne [string]$contextEntry.Value) {
                    Add-P1AstCode $codes "P1_AST_EVIDENCE_CONTEXT_INVALID"
                }
            }

            $nameStatusEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "NameStatusRecords"
            if (-not $nameStatusEntry.Found -or $nameStatusEntry.Value -is [string] `
                -or $nameStatusEntry.Value -isnot [System.Collections.IList] `
                -or $nameStatusEntry.Value.Count -gt 999 `
                -or $nameStatusEntry.Value.Count -ne $files.Count) {
                Add-P1AstCode $codes "P1_AST_EVIDENCE_FILE_SET_INVALID"
            } else {
                for ($fileIndex = 0; $fileIndex -lt $nameStatusEntry.Value.Count; $fileIndex++) {
                    $nameStatusRecord = $nameStatusEntry.Value[$fileIndex]
                    $trustedPath = ""
                    $trustedStatus = ""
                    $trustedRecordValid = $true
                    if ($nameStatusRecord -is [string]) {
                        $nameStatusMatch = [regex]::Match([string]$nameStatusRecord, '^([AM])\t([^\t]+)$')
                        if (-not $nameStatusMatch.Success) {
                            $trustedRecordValid = $false
                        } else {
                            $trustedStatus = $nameStatusMatch.Groups[1].Value
                            $trustedPath = $nameStatusMatch.Groups[2].Value
                        }
                    } elseif ($null -ne $nameStatusRecord) {
                        $pathProperty = $nameStatusRecord.PSObject.Properties["Path"]
                        $statusProperty = $nameStatusRecord.PSObject.Properties["Status"]
                        if ($null -eq $pathProperty -or $pathProperty.Value -isnot [string] `
                            -or $null -eq $statusProperty -or $statusProperty.Value -isnot [string]) {
                            $trustedRecordValid = $false
                        } else {
                            $trustedPath = [string]$pathProperty.Value
                            $trustedStatus = [string]$statusProperty.Value
                        }
                    } else {
                        $trustedRecordValid = $false
                    }
                    if (-not $trustedRecordValid -or -not (Test-P1AstCandidatePath $trustedPath) `
                        -or $trustedStatus -cnotin @("A", "M") `
                        -or $trustedPath -cne [string]$files[$fileIndex].Path `
                        -or $trustedStatus -cne [string]$files[$fileIndex].Status) {
                        Add-P1AstCode $codes "P1_AST_EVIDENCE_FILE_SET_INVALID"
                    }
                }
            }

            $effectiveFacts = [ordered]@{}
            foreach ($factKey in $Facts.Keys) { $effectiveFacts[$factKey] = $Facts[$factKey] }
            $candidateTextMap = [ordered]@{}
            $candidateTextEntry = Get-P1AstOrdinalDictionaryEntry -Dictionary $Facts -Key "CandidateFileTextByPath"
            if ($candidateTextEntry.Found -and $candidateTextEntry.Value -is [System.Collections.IDictionary]) {
                foreach ($candidatePath in $candidateTextEntry.Value.Keys) { $candidateTextMap[$candidatePath] = $candidateTextEntry.Value[$candidatePath] }
            }
            $candidateTextMap[$SourcePath] = $Text
            $effectiveFacts["CandidateFileTextByPath"] = $candidateTextMap
            $effectiveFacts["MachineEvidenceSourcePath"] = $SourcePath
            $expectedCandidateIdentity = if ([string]$values.candidateIdentityType -ceq "commit_sha") {
                Get-P1AstFactText $effectiveFacts "CandidateCommitSha"
            } else {
                Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $effectiveFacts
            }
            if ([string]$values.candidateIdentity -cne $expectedCandidateIdentity) { Add-P1AstCode $codes "P1_AST_EVIDENCE_CANDIDATE_INVALID" }
            $commandMatches = @($commands | Where-Object { $_.Name -ceq $Command }).Count -eq 1
            if ([string]::IsNullOrWhiteSpace($Command) -or -not $commandMatches) { Add-P1AstCode $codes "P1_AST_EVIDENCE_CONTEXT_INVALID" }
            $trustedProfile = Get-P1AstFactText $effectiveFacts "ValidationProfile"
            $expectedFreshnessKey = if ($commandMatches -and $trustedProfile -cin @("focused", "full", "contract-instance-only", "docs-only")) {
                Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $effectiveFacts -Profile $trustedProfile -Command $Command
            } else { "" }
            if ([string]$values.freshnessKey -cne $expectedFreshnessKey) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FRESHNESS_INVALID" }
            foreach ($binding in @(
                @{ Evidence = "baseSha"; Fact = "BaseSha" }, @{ Evidence = "validatorSha256"; Fact = "CommonSha256" },
                @{ Evidence = "p1AdapterSha256"; Fact = "P1AdapterSha256" }, @{ Evidence = "preCommitAdapterSha256"; Fact = "PreCommitAdapterSha256" },
                @{ Evidence = "prePushAdapterSha256"; Fact = "PrePushAdapterSha256" }, @{ Evidence = "fixtureSha256"; Fact = "FixtureSha256" },
                @{ Evidence = "stateToSha256"; Fact = "StateProjectionSha256" }, @{ Evidence = "queueToSha256"; Fact = "QueueProjectionSha256" }
            )) {
                if ([string]$values[$binding.Evidence] -cne (Get-P1AstFactText $effectiveFacts $binding.Fact)) { Add-P1AstCode $codes "P1_AST_EVIDENCE_FRESHNESS_INVALID" }
            }
        }
    }
    return [pscustomobject]@{
        Recognized = [bool]$recognized
        ParserValid = [bool]$parserValid
        Valid = $codes.Count -eq 0
        FindingCodes = @($codes)
        Values = $values
        Commands = @($commands)
        Files = @($files)
        SourcePath = $SourcePath.Replace("\", "/")
        RawText = $Text
    }
}
