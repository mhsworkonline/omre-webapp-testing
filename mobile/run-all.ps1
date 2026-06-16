$env:JAVA_HOME = "C:\Users\manis\scoop\apps\openjdk\current"
Set-Location $PSScriptRoot

$maestro = "C:\Users\manis\scoop\shims\maestro.cmd"
$maestroTests = "$env:USERPROFILE\.maestro\tests"
$reportsDir = "$PSScriptRoot\reports"
New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$manifestFile = "$reportsDir\run-$timestamp-manifest.json"

$flows = Get-ChildItem "$PSScriptRoot\flows" -Recurse -Filter "*.yaml" | Sort-Object FullName
if ($flows.Count -eq 0) { Write-Host "No flows found."; exit 1 }

Write-Host ""
Write-Host "OMRE Mobile Test Suite" -ForegroundColor Cyan
Write-Host "Running $($flows.Count) flow(s)..." -ForegroundColor Cyan
Write-Host ""

$manifest = @()

foreach ($flow in $flows) {
    $relPath = $flow.FullName.Substring($PSScriptRoot.Length + 1)
    $name = [System.IO.Path]::GetFileNameWithoutExtension($flow.Name)

    # Snapshot existing debug folders before run
    $before = if (Test-Path $maestroTests) {
        (Get-ChildItem $maestroTests -Directory).Name
    } else { @() }

    Write-Host "  Running: $relPath" -NoNewline
    $output = & $maestro test $flow.FullName 2>&1
    $exitCode = $LASTEXITCODE

    # Find the new debug folder created by this run
    $after = if (Test-Path $maestroTests) {
        (Get-ChildItem $maestroTests -Directory).Name
    } else { @() }
    $newDir = $after | Where-Object { $_ -notin $before } | Select-Object -Last 1
    $debugPath = if ($newDir) { "$maestroTests\$newDir" } else { "" }

    $status = if ($exitCode -eq 0) { "PASSED" } else { "FAILED" }
    $color  = if ($exitCode -eq 0) { "Green" } else { "Red" }
    Write-Host "  [$status]" -ForegroundColor $color

    $manifest += @{
        name     = $name
        file     = $relPath
        status   = $status
        debugDir = $debugPath
    }
}

# Write manifest for the report generator
$manifest | ConvertTo-Json -Depth 3 | Out-File $manifestFile -Encoding utf8

Write-Host ""
Write-Host "Generating reports..." -ForegroundColor Cyan
node "$PSScriptRoot\generate-report.js" $manifestFile

Write-Host ""
Write-Host "Reports saved to: $reportsDir" -ForegroundColor Green
