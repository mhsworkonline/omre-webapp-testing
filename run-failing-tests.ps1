Set-Location $PSScriptRoot

# Find the latest JSON result file
$jsonFiles = Get-ChildItem "test-results\*.json" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^\d{4}-\d{2}-\d{2}' } |
    Sort-Object Name -Descending

if (-not $jsonFiles) {
    Write-Host "No result files found. Run the full suite first:" -ForegroundColor Yellow
    Write-Host "  npx playwright test --project=chromium --workers=8"
    exit 1
}

$latestJson = $jsonFiles[0].FullName
Write-Host "Reading results from: $($jsonFiles[0].Name)"

# Extract failed test titles from JSON
$data = Get-Content $latestJson -Raw | ConvertFrom-Json

function Get-FailedTitles($suites) {
    $titles = @()
    foreach ($suite in $suites) {
        foreach ($spec in $suite.specs) {
            foreach ($test in $spec.tests) {
                if ($test.results -and $test.results[0].status -eq 'failed') {
                    $titles += [regex]::Escape($spec.title)
                }
            }
        }
        if ($suite.suites) {
            $titles += Get-FailedTitles $suite.suites
        }
    }
    return $titles
}

$failedTitles = Get-FailedTitles $data.suites

if ($failedTitles.Count -eq 0) {
    Write-Host "No failures found in last run. Nothing to retry." -ForegroundColor Green
    exit 0
}

Write-Host "Retrying $($failedTitles.Count) failed test(s)..." -ForegroundColor Cyan

$grep = $failedTitles -join "|"
npx playwright test --project=chromium --workers=8 --grep $grep
