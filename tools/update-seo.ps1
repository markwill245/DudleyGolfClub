# Dudley Golf Club
# Updates SEO tags from tools/seo-data.csv
# Safe: only updates SEO tags, not the whole head

$projectRoot = Split-Path $PSScriptRoot -Parent
$seoFile = Join-Path $PSScriptRoot "seo-data.csv"

$baseUrl = "https://dudley-golf-club.vercel.app"
$ogImage = "$baseUrl/images/dudley.webp"

$seoRows = Import-Csv $seoFile

foreach ($row in $seoRows) {

    $filePath = Join-Path $projectRoot $row.file

    if (-not (Test-Path $filePath)) {
        Write-Host "SKIPPED missing file: $($row.file)" -ForegroundColor Yellow
        continue
    }

    $content = Get-Content $filePath -Raw
    $original = $content

    $title = $row.title
    $description = $row.description
    $keywords = $row.keywords
    $canonical = "$baseUrl/$($row.file)"
    if ($row.file -eq "index.html") { $canonical = "$baseUrl/" }

    $seoBlock = @"
<!-- MASTER SEO TEMPLATE -->
<title>$title</title>

<meta name="description" content="$description">
<meta name="keywords" content="$keywords">
<meta name="author" content="Dudley Golf Club">

<link rel="canonical" href="$canonical">
<meta name="theme-color" content="#132419">

<meta property="og:title" content="$title">
<meta property="og:description" content="$description">
<meta property="og:type" content="website">
<meta property="og:url" content="$canonical">
<meta property="og:image" content="$ogImage">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="$title">
<meta name="twitter:description" content="$description">
<meta name="twitter:image" content="$ogImage">
<!-- END MASTER SEO TEMPLATE -->
"@

    if ($content -match '(?s)<!-- MASTER SEO TEMPLATE -->.*?<!-- END MASTER SEO TEMPLATE -->') {
        $content = [regex]::Replace($content, '(?s)<!-- MASTER SEO TEMPLATE -->.*?<!-- END MASTER SEO TEMPLATE -->', $seoBlock, 1)
    }
    else {
        $content = [regex]::Replace(
            $content,
            '(?s)<title>.*?</title>(\s*<!-- Search Engine Tags -->.*?)(?=<!-- Open Graph|<link|<script|<style)',
            $seoBlock,
            1
        )
    }

    if ($content -ne $original) {
        Set-Content $filePath $content
        Write-Host "Updated SEO: $($row.file)"
    }
}