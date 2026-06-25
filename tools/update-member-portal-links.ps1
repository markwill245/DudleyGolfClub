# Dudley Golf Club
# Change Members Portal links to login.html
# Keeps Member iGolf links unchanged

$projectRoot = Split-Path $PSScriptRoot -Parent

Get-ChildItem $projectRoot -Filter *.html | ForEach-Object {

    $file = $_.FullName
    $content = Get-Content $file -Raw
    $original = $content

    $content = $content.Replace('href="members-area.html"', 'href="login.html"')

    if ($content -ne $original) {
        Set-Content $file $content
        Write-Host "Updated $($_.Name)"
    }
}