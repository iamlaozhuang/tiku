param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$RepositoryRoot = "."
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title
    )

    Write-Output ""
    Write-Output "== $Title =="
}

function Add-Finding {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $script:findings += $Message
    Write-Output "FAIL $Message"
}

$findings = @()
$root = (Resolve-Path -LiteralPath $RepositoryRoot).Path

Write-Section -Title "Naming Convention Scan"
Write-Output "root: $root"

$sourceRoots = @(
    "src\server",
    "src\app\api\v1"
) | ForEach-Object { Join-Path -Path $root -ChildPath $_ } | Where-Object { Test-Path $_ }

$sourceFiles = @()
foreach ($sourceRoot in $sourceRoots) {
    $sourceFiles += Get-ChildItem -Path $sourceRoot -Recurse -File |
        Where-Object { $_.Extension -in @(".ts", ".tsx") }
}

Write-Output "sourceFiles: $($sourceFiles.Count)"

Write-Section -Title "Banned Business Terms"
$bannedTermPattern = "\b(license|exam_paper)\b"
$bannedTermMatches = @()
foreach ($sourceFile in $sourceFiles) {
    $bannedTermMatches += Select-String -LiteralPath $sourceFile.FullName -Pattern $bannedTermPattern -AllMatches
}

if ($bannedTermMatches.Count -eq 0) {
    Write-Output "OK banned terms absent"
} else {
    foreach ($match in $bannedTermMatches) {
        Add-Finding "$($match.Path):$($match.LineNumber) banned term '$($match.Matches[0].Value)'"
    }
}

Write-Section -Title "Risky Generic Terms"
$genericTermPattern = "\b(section|option)\b"
$genericMatches = @()
foreach ($sourceFile in $sourceFiles) {
    $genericMatches += Select-String -LiteralPath $sourceFile.FullName -Pattern $genericTermPattern -CaseSensitive
}

if ($genericMatches.Count -eq 0) {
    Write-Output "OK standalone section/option absent"
} else {
    foreach ($match in $genericMatches) {
        Add-Finding "$($match.Path):$($match.LineNumber) standalone generic term requires glossary-specific naming"
    }
}

Write-Section -Title "API Route Folder Case"
$routeRoot = Join-Path -Path $root -ChildPath "src\app\api\v1"
if (Test-Path $routeRoot) {
    $routeDirectories = Get-ChildItem -Path $routeRoot -Directory -Recurse
    foreach ($routeDirectory in $routeDirectories) {
        $segment = $routeDirectory.Name

        if ($segment -match "^\[[A-Za-z][A-Za-z0-9]*\]$") {
            $parameterName = $segment.Trim("[", "]")
            $lowerParameterName = $parameterName.ToLowerInvariant()
            if ($lowerParameterName -eq "id" -or ($lowerParameterName.EndsWith("id") -and -not $lowerParameterName.EndsWith("publicid"))) {
                Add-Finding "$($routeDirectory.FullName) dynamic route parameter must use publicId naming"
            }
            continue
        }

        if ($segment -notmatch "^[a-z0-9]+(-[a-z0-9]+)*$") {
            Add-Finding "$($routeDirectory.FullName) route folder must be kebab-case"
        }
    }

    if ($findings.Count -eq 0) {
        Write-Output "OK route folders use kebab-case and public-id route params"
    }
} else {
    Write-Output "SKIP route root missing: $routeRoot"
}

Write-Section -Title "API Contract DTO Field Case"
$contractRoot = Join-Path -Path $root -ChildPath "src\server\contracts"
if (Test-Path $contractRoot) {
    $contractFiles = Get-ChildItem -Path $contractRoot -Filter "*.ts" -File |
        Where-Object { $_.Name -notlike "*.test.ts" }

    foreach ($contractFile in $contractFiles) {
        $lineNumber = 0
        foreach ($line in Get-Content -LiteralPath $contractFile.FullName) {
            $lineNumber++
            if ($line -match "^\s*([A-Za-z][A-Za-z0-9_]*)\??\s*:") {
                $fieldName = $Matches[1]
                if ($fieldName -match "_") {
                    Add-Finding "$($contractFile.FullName):$lineNumber DTO field '$fieldName' must be camelCase"
                }
            }
        }
    }

    if ($findings.Count -eq 0) {
        Write-Output "OK contract DTO fields are camelCase"
    }
} else {
    Write-Output "SKIP contract root missing: $contractRoot"
}

Write-Section -Title "Result"
if ($findings.Count -gt 0) {
    throw "Naming convention scan failed with $($findings.Count) finding(s)."
}

Write-Output "naming convention scan completed"
