$projectRoot = Split-Path $PSScriptRoot -Parent
$masterFile = Join-Path $projectRoot "index.html"
$masterContent = Get-Content $masterFile -Raw

$navPattern = '(?s)<nav\s.*?</nav>'

$masterNav = [regex]::Match($masterContent, $navPattern).Value

Get-ChildItem -Filter *.html | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw

    if ($content -match $navPattern) {
        $newContent = [regex]::Replace($content, $navPattern, $masterNav, 1)
        Set-Content $file $newContent
        Write-Host "Updated nav in $($_.Name)"
    }
}