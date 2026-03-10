$ErrorActionPreference = "Stop"

$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendDir

$certPath = Join-Path $backendDir "src/main/resources/certs/global-bundle.pem"
if (-not (Test-Path $certPath)) {
    throw "RDS cert not found at: $certPath"
}

$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://aasha-db.cdqqyouowfxn.ap-south-1.rds.amazonaws.com:5432/aasha_db?ssl=true&sslmode=verify-full&sslrootcert=$certPath"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "postgre123"

$proc = Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "spring-boot:run" -PassThru

try {
    $healthy = $false
    for ($i = 0; $i -lt 60; $i++) {
        Start-Sleep -Seconds 2
        try {
            $health = Invoke-RestMethod "http://localhost:8080/api/healthz" -TimeoutSec 2
            if ($health.status -eq "ok") {
                $healthy = $true
                break
            }
        } catch {
        }
    }

    if (-not $healthy) {
        throw "Backend did not become healthy on http://localhost:8080/api/healthz"
    }

    $testId = "rds-test-" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $payload = @{
        id = $testId
        patientName = "RDS Check"
        age = 29
        phone = "9999999999"
        patientType = "Pregnant Woman"
        rawText = "fever"
        language = "en"
        structured = @{ symptoms = @("fever") }
        riskLevel = "Low"
        createdAt = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
        sourceDevice = "local-check"
    } | ConvertTo-Json -Depth 8

    $insert = Invoke-RestMethod -Uri "http://localhost:8080/api/records" -Method Post -ContentType "application/json" -Body $payload
    $list = Invoke-RestMethod -Uri "http://localhost:8080/api/records?limit=5" -Method Get

    Write-Host "HEALTH: OK"
    Write-Host "INSERT: $($insert.message)"
    Write-Host "LATEST ID: $($list.records[0].id)"
    Write-Host "DB CHECK: PASS"
} finally {
    if ($proc -and -not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force
    }
}
