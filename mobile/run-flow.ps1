param([Parameter(Mandatory)][string]$Flow)

$env:JAVA_HOME = "C:\Users\manis\scoop\apps\openjdk\current"
Set-Location $PSScriptRoot
& "C:\Users\manis\scoop\shims\maestro.cmd" test $Flow
