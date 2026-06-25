# Dudley Golf Club
# Website Health Check V3 - does not change files

$startTime = Get-Date
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
   "view-my-stock.html",
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
$titleIssues = @()
$descriptionIssues = @()
$returnHomeIssues = @()
$titles = @{}
$imageCount = 0
$linkCount = 0

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

    if ($content -match '<title>\s*(.*?)\s*</title>') {
        $title = $matches[1].Trim()

        if ([string]::IsNullOrWhiteSpace($title)) {
            $titleIssues += "$name -> Empty title"
        } else {
            if (-not $titles.ContainsKey($title)) {
                $titles[$title] = @()
            }

            $titles[$title] += $name
        }
    } else {
        $titleIssues += "$name -> Missing title"
    }

    if ($content -notmatch '<meta\s+name="description"') {
        $descriptionIssues += "$name -> Missing meta description"
    }

    if (
        $name -notin @("index.html", "admin-status.html") -and
        $content -notmatch 'aria-label="Return Home"' -and
        $content -notmatch '← Back to Members Area'
    ) {
        $returnHomeIssues += "$name -> Missing return/back button"
    }

    $srcMatches = [regex]::Matches($content, 'src="([^"]+)"')

    foreach ($m in $srcMatches) {
        $src = $m.Groups[1].Value
        $imageCount++

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
        $linkCount++

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

$duplicateTitleIssues = @()

foreach ($key in $titles.Keys) {
    if ($titles[$key].Count -gt 1) {
        $duplicateTitleIssues += "$key -> $($titles[$key] -join ', ')"
    }
}

$totalIssues =
    $issues.Count +
    $imageIssues.Count +
    $linkIssues.Count +
    $titleIssues.Count +
    $descriptionIssues.Count +
    $duplicateTitleIssues.Count +
    $returnHomeIssues.Count

$totalChecks = 8
$passedChecks = 0

if ($issues.Count -eq 0) { $passedChecks++ }
if ($imageIssues.Count -eq 0) { $passedChecks++ }
if ($linkIssues.Count -eq 0) { $passedChecks++ }
if ($titleIssues.Count -eq 0) { $passedChecks++ }
if ($descriptionIssues.Count -eq 0) { $passedChecks++ }
if ($duplicateTitleIssues.Count -eq 0) { $passedChecks++ }
if ($returnHomeIssues.Count -eq 0) { $passedChecks++ }
if ($htmlFiles.Count -gt 0) { $passedChecks++ }

$healthScore = [math]::Round(($passedChecks / $totalChecks) * 100)
$scanTime = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 2)

Write-Host ""
Write-Host "==========================================="
Write-Host "DUDLEY GOLF CLUB WEBSITE HEALTH REPORT V3"
Write-Host "==========================================="
Write-Host ""

Write-Host "HTML Pages............... $($htmlFiles.Count)"
Write-Host "Links Checked............ $linkCount"
Write-Host "Images/Files Checked..... $imageCount"
Write-Host "Scan Time................ $scanTime sec"
Write-Host ""

if ($issues.Count -eq 0) {
    Write-Host "Navigation/Footer........ PASS" -ForegroundColor Green
} else {
    Write-Host "Navigation/Footer........ $($issues.Count) issue(s)" -ForegroundColor Red
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

if ($titleIssues.Count -eq 0) {
    Write-Host "Page Titles.............. PASS" -ForegroundColor Green
} else {
    Write-Host "Page Titles.............. $($titleIssues.Count) issue(s)" -ForegroundColor Yellow
}

if ($descriptionIssues.Count -eq 0) {
    Write-Host "Meta Descriptions........ PASS" -ForegroundColor Green
} else {
    Write-Host "Meta Descriptions........ $($descriptionIssues.Count) issue(s)" -ForegroundColor Yellow
}

if ($duplicateTitleIssues.Count -eq 0) {
    Write-Host "Duplicate Titles......... PASS" -ForegroundColor Green
} else {
    Write-Host "Duplicate Titles......... $($duplicateTitleIssues.Count) issue(s)" -ForegroundColor Yellow
}

if ($returnHomeIssues.Count -eq 0) {
    Write-Host "Return/Back Buttons...... PASS" -ForegroundColor Green
} else {
    Write-Host "Return/Back Buttons...... $($returnHomeIssues.Count) issue(s)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Overall Health........... $healthScore%"

if ($totalIssues -eq 0) {
    Write-Host "Website Status........... READY TO DEPLOY" -ForegroundColor Green
} else {
    Write-Host "Website Status........... CHECK REQUIRED" -ForegroundColor Red

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

    if ($titleIssues.Count -gt 0) {
        Write-Host ""
        Write-Host "Title Issues:"
        $titleIssues | ForEach-Object { Write-Host " - $_" }
    }

    if ($descriptionIssues.Count -gt 0) {
        Write-Host ""
        Write-Host "Meta Description Issues:"
        $descriptionIssues | ForEach-Object { Write-Host " - $_" }
    }

    if ($duplicateTitleIssues.Count -gt 0) {
        Write-Host ""
        Write-Host "Duplicate Title Issues:"
        $duplicateTitleIssues | ForEach-Object { Write-Host " - $_" }
    }

    if ($returnHomeIssues.Count -gt 0) {
        Write-Host ""
        Write-Host "Return/Back Button Issues:"
        $returnHomeIssues | ForEach-Object { Write-Host " - $_" }
    }
}

Write-Host ""
Write-Host "==========================================="
Write-Host ""