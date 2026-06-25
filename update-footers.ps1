$masterFile = "membership.html"

$masterContent = Get-Content $masterFile -Raw

$footerPattern = '(?s)<!-- MASTER FOOTER -->.*?</footer>'

$masterFooter = [regex]::Match($masterContent, $footerPattern).Value

Get-ChildItem -Filter *.html | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw

    if ($content -match $footerPattern) {
        $newContent = [regex]::Replace($content, $footerPattern, $masterFooter)
        Set-Content $file $newContent
        Write-Host "Updated footer in $($_.Name)"
    }
}