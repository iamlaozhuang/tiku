param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$EnvPath = ".env.local",

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 30)]
    [int]$TimeoutSecond = 10
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Net.Http

$requestCount = 0
$retryCount = 0
$boundedMaxTokens = 4

function Read-LocalEnvFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $envValues = @{}

    if (-not (Test-Path -LiteralPath $Path)) {
        return $envValues
    }

    foreach ($line in Get-Content -LiteralPath $Path -Encoding UTF8) {
        $trimmedLine = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmedLine) -or $trimmedLine.StartsWith("#")) {
            continue
        }

        if ($trimmedLine -notmatch "^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$") {
            continue
        }

        $key = $Matches[1]
        $value = $Matches[2].Trim()
        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        $envValues[$key] = $value
    }

    return $envValues
}

function Get-EnvValue {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$EnvValues,

        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if (-not $EnvValues.ContainsKey($Name)) {
        return $null
    }

    $value = [string]$EnvValues[$Name]
    if ([string]::IsNullOrWhiteSpace($value)) {
        return $null
    }

    return $value.Trim()
}

function Get-LatencyBucket {
    param(
        [Parameter(Mandatory = $true)]
        [long]$LatencyMs
    )

    if ($LatencyMs -lt 1000) {
        return "lt_1s"
    }

    if ($LatencyMs -lt 3000) {
        return "1s_to_3s"
    }

    if ($LatencyMs -lt 10000) {
        return "3s_to_10s"
    }

    return "gte_10s"
}

function Write-SanitizedSummary {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Summary
    )

    $baseSummary = [ordered]@{
        provider = "deepseek"
        appEnv = $Summary.appEnv
        aiProviderEnabled = $Summary.aiProviderEnabled
        apiKey = $Summary.apiKey
        baseUrlHost = $Summary.baseUrlHost
        baseUrlDeepSeek = $Summary.baseUrlDeepSeek
        modelConfigured = $Summary.modelConfigured
        boundedSample = $true
        maxTokens = $boundedMaxTokens
        requestCount = $Summary.requestCount
        retryCount = $retryCount
        httpStatus = $Summary.httpStatus
        latencyBucket = $Summary.latencyBucket
        choicesPresent = $Summary.choicesPresent
        usagePresent = $Summary.usagePresent
        failureClass = $Summary.failureClass
        redaction = "redacted; no API key; no secret; bounded sample; no raw prompt; no raw answer; no raw model response; no provider payload"
        result = $Summary.result
    }

    $baseSummary | ConvertTo-Json -Depth 6
}

$envValues = Read-LocalEnvFile -Path $EnvPath
$appEnv = Get-EnvValue -EnvValues $envValues -Name "APP_ENV"
$providerEnabled = Get-EnvValue -EnvValues $envValues -Name "AI_PROVIDER_ENABLED"
$apiKey = Get-EnvValue -EnvValues $envValues -Name "DEEPSEEK_API_KEY"
$baseUrl = Get-EnvValue -EnvValues $envValues -Name "DEEPSEEK_BASE_URL"
$model = Get-EnvValue -EnvValues $envValues -Name "DEEPSEEK_MODEL"
$baseUrlHost = $null
$baseUrlDeepSeek = $false
$failureClass = $null
$result = "blocked"

try {
    if ($appEnv -ne "dev") {
        $failureClass = "invalid_app_env"
        throw "invalid_app_env"
    }

    if ($providerEnabled -ne "true") {
        $failureClass = "provider_disabled"
        throw "provider_disabled"
    }

    if ($null -eq $apiKey) {
        $failureClass = "missing_deepseek_api_key"
        throw "missing_deepseek_api_key"
    }

    if ($null -eq $baseUrl) {
        $failureClass = "missing_deepseek_base_url"
        throw "missing_deepseek_base_url"
    }

    if ($null -eq $model) {
        $failureClass = "missing_deepseek_model"
        throw "missing_deepseek_model"
    }

    $baseUri = [System.Uri]::new($baseUrl)
    $baseUrlHost = $baseUri.Host
    $baseUrlDeepSeek = $baseUrlHost -match "(^|\.)deepseek\.com$"

    if ($baseUri.Scheme -ne "https" -or -not $baseUrlDeepSeek) {
        $failureClass = "invalid_deepseek_base_url"
        throw "invalid_deepseek_base_url"
    }

    $normalizedBaseUrl = $baseUri.AbsoluteUri.TrimEnd("/")
    if ($normalizedBaseUrl -notmatch "/v1$") {
        $normalizedBaseUrl = "$normalizedBaseUrl/v1"
    }
    $endpoint = [System.Uri]::new("$normalizedBaseUrl/chat/completions")

    $handler = [System.Net.Http.HttpClientHandler]::new()
    $handler.AllowAutoRedirect = $false
    $client = [System.Net.Http.HttpClient]::new($handler)
    $client.Timeout = [TimeSpan]::FromSeconds($TimeoutSecond)

    $payload = [ordered]@{
        model = $model
        messages = @(
            [ordered]@{
                role = "system"
                content = "Local dev smoke check. Reply OK only."
            },
            [ordered]@{
                role = "user"
                content = "Return OK."
            }
        )
        max_tokens = $boundedMaxTokens
        temperature = 0
        stream = $false
    }
    $payloadJson = $payload | ConvertTo-Json -Depth 8 -Compress
    $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Post, $endpoint)
    $request.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $apiKey)
    $request.Content = [System.Net.Http.StringContent]::new($payloadJson, [System.Text.Encoding]::UTF8, "application/json")

    $requestCount = 1
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = $client.SendAsync($request).GetAwaiter().GetResult()
    $stopwatch.Stop()
    $latencyBucket = Get-LatencyBucket -LatencyMs $stopwatch.ElapsedMilliseconds
    $httpStatus = [int]$response.StatusCode

    if ($httpStatus -ne 200) {
        Write-SanitizedSummary -Summary @{
            appEnv = $appEnv
            aiProviderEnabled = $true
            apiKey = "present_redacted"
            baseUrlHost = $baseUrlHost
            baseUrlDeepSeek = $baseUrlDeepSeek
            modelConfigured = $true
            requestCount = $requestCount
            httpStatus = $httpStatus
            latencyBucket = $latencyBucket
            choicesPresent = $false
            usagePresent = $false
            failureClass = "http_error"
            result = "failed"
        }
        exit 1
    }

    $responseJson = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    $responsePayload = $responseJson | ConvertFrom-Json
    $choicesPresent = $null -ne $responsePayload.choices -and @($responsePayload.choices).Count -gt 0
    $usagePresent = $null -ne $responsePayload.usage

    if (-not $choicesPresent -or -not $usagePresent) {
        $result = "failed"
        $failureClass = "missing_expected_provider_fields"
    } else {
        $result = "pass"
        $failureClass = $null
    }

    Write-SanitizedSummary -Summary @{
        appEnv = $appEnv
        aiProviderEnabled = $true
        apiKey = "present_redacted"
        baseUrlHost = $baseUrlHost
        baseUrlDeepSeek = $baseUrlDeepSeek
        modelConfigured = $true
        requestCount = $requestCount
        httpStatus = $httpStatus
        latencyBucket = $latencyBucket
        choicesPresent = $choicesPresent
        usagePresent = $usagePresent
        failureClass = $failureClass
        result = $result
    }

    if ($result -ne "pass") {
        exit 1
    }
} catch {
    if ($null -eq $failureClass) {
        if ($_.Exception.GetType().FullName -match "TaskCanceled") {
            $failureClass = "timeout"
        } else {
            $failureClass = "network_or_runtime_error"
        }
    }

    Write-SanitizedSummary -Summary @{
        appEnv = if ($null -eq $appEnv) { "missing" } else { $appEnv }
        aiProviderEnabled = $providerEnabled -eq "true"
        apiKey = if ($null -eq $apiKey) { "missing" } else { "present_redacted" }
        baseUrlHost = $baseUrlHost
        baseUrlDeepSeek = $baseUrlDeepSeek
        modelConfigured = $null -ne $model
        requestCount = $requestCount
        httpStatus = $null
        latencyBucket = $null
        choicesPresent = $false
        usagePresent = $false
        failureClass = $failureClass
        result = $result
    }
    exit 1
} finally {
    if ($null -ne $request) {
        $request.Dispose()
    }

    if ($null -ne $response) {
        $response.Dispose()
    }

    if ($null -ne $client) {
        $client.Dispose()
    }

    if ($null -ne $handler) {
        $handler.Dispose()
    }
}
