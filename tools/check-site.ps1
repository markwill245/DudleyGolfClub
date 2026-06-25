# Dudley Golf Club
# Website Health Check V2 - does not change files

$projectRoot = Split-Path $PSScriptRoot -Parent
$htmlFiles = Get-ChildItem $projectRoot -Filter *.html

$specialPages = @(
    "admin-status.html",
    "members-login.html",
    "visitor-booking.html",
    "login.html",
    "meet-the-team.html",
    "section.html",
    "social-events.html",
    "upcoming-comps.html",
    "board-winners.html",
    "1893-club.html",
    "captains.html",
    "charity.html",
    "enquire.html",
    "functions.html",
    "junior-comps.html",
    "junior-past-winners.html",
    "members-area.html",
    "new-members-area.html",
    "pro-shop1.html",
    "results.html",
    "societies.html",
    "wm-17-24-league.html",
    "wm-league.html",
    "wm-low-league.html",
    "wm-mid-league.html",
    "comp-winners.html"
)

$issues = @()
$imageIssues = @()
$linkIssues = @()

foreach ($file in $htmlFiles) {

    $content = Get-Content $file.FullName -Raw
    $name = $file.Name
    $isSpecial = $specialPages -contains $name

    if (-not $isSpecial) {
        if ($content -notmatch '<!-- MASTER FOOTER -->') {
            $issues += "MISSING FOOTER: $name"
        }

        if ($content -notmatch '<nav') {
            $issues += "MISSING NAV: $name"
        }
    }

    if ($content -match 'href="members-area.html".*Members Portal') {
        $issues += "WRONG MEMBERS PORTAL LINK: $name"
    }

    if ($content -match 'href="href=') {
        $issues += "BROKEN HREF: $name"
    }

    if ($content -match 'href="members-login.html" features') {
        $issues += "BAD TEXT LEFTOVER: $name"
    }

    $srcMatches = [regex]::Matches($content, 'src="([^"]+)"')

    foreach ($m in $srcMatches) {
        $src = $m.Groups[1].Value

        if (
            $src.StartsWith("http") -or
            $src.StartsWith("//") -or
            $src.StartsWith("data:") -or
            $src.StartsWith("/_vercel/") -or
            $src.Contains('${')
        ) {
            continue
        }

        $cleanSrc = $src.Split("?")[0].TrimStart("/")
        $path = Join-Path $projectRoot $cleanSrc

        if (-not (Test-Path $path)) {
            $imageIssues += "$name -> $src"
        }
    }

    $hrefMatches = [regex]::Matches($content, 'href="([^"]+)"')

    foreach ($m in $hrefMatches) {
        $href = $m.Groups[1].Value

        if (
            $href.StartsWith("http") -or
            $href.StartsWith("mailto:") -or
            $href.StartsWith("tel:") -or
            $href.StartsWith("#") -or
            $href.StartsWith("javascript:") -or
            $href.Contains('${')
        ) {
            continue
        }

        $cleanHref = $href.Split("?")[0].Split("#")[0].TrimStart("/")

        if ($cleanHref -eq "") {
            continue
        }

        $path = Join-Path $projectRoot $cleanHref

        if (-not (Test-Path $path)) {
            $linkIssues += "$name -> $href"
        }
    }
}

$totalIssues = $issues.Count + $imageIssues.Count + $linkIssues.Count

Write-Host ""
Write-Host "==========================================="
Write-Host "DUDLEY GOLF CLUB WEBSITE HEALTH REPORT"
Write-Host "==========================================="
Write-Host ""

Write-Host "HTML Pages............... $($htmlFiles.Count)"

if ($issues.Count -eq 0) {
    Write-Host "Navigation/Footer........ PASS" -ForegroundColor Green
} else {
    Write-Host "Navigation/Footer........ ISSUES FOUND" -ForegroundColor Red
}

if ($imageIssues.Count -eq 0) {
    Write-Host "Images/Files............. PASS" -ForegroundColor Green
} else {
    Write-Host "Images/Files............. $($imageIssues.Count) issue(s)" -ForegroundColor Yellow
}

if ($linkIssues.Count -eq 0) {
    Write-Host "Internal Links........... PASS" -ForegroundColor Green
} else {
    Write-Host "Internal Links........... $($linkIssues.Count) issue(s)" -ForegroundColor Yellow
}

if ($totalIssues -eq 0) {
    Write-Host ""
    Write-Host "Website Status: READY TO DEPLOY" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Website Status: CHECK REQUIRED" -ForegroundColor Red

    if ($issues.Count -gt 0) {
        Write-Host ""
        Write-Host "Navigation/Footer Issues:"
        $issues | ForEach-Object { Write-Host " - $_" }
    }

    if ($imageIssues.Count -gt 0) {
        Write-Host ""
        Write-Host "Missing Images/Files:"
        $imageIssues | ForEach-Object { Write-Host " - $_" }
    }

    if ($linkIssues.Count -gt 0) {
        Write-Host ""
        Write-Host "Broken Internal Links:"
        $linkIssues | ForEach-Object { Write-Host " - $_" }
    }
}

Write-Host ""
Write-Host "==========================================="
Write-Host ""