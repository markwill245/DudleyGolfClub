$projectRoot = Split-Path $PSScriptRoot -Parent

Get-ChildItem $projectRoot -Filter *.html | ForEach-Object {

    $file = $_.FullName
    $content = Get-Content $file -Raw
    $original = $content

    $content = $content -replace 'href="login.html"(\s+class="back-btn")', 'href="members-area.html"$1'

    if ($content -ne $original) {
        Set-Content $file $content
        Write-Host "Fixed $($_.Name)"
    }
}