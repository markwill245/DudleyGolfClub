# Dudley Golf Club
# Website health check - does not change files

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

Write-Host ""
Write-Host "Dudley Golf Club Website Check"
Write-Host "================================"
Write-Host ""

foreach ($file in $htmlFiles) {

    $content = Get-Content $file.FullName -Raw
    $name = $file.Name

    $isSpecial = $specialPages -contains $name

    if (-not $isSpecial) {
        if ($content -notmatch '<!-- MASTER FOOTER -->') {
            Write-Host "MISSING FOOTER: $name" -ForegroundColor Red
        }

        if ($content -notmatch '<nav') {
            Write-Host "MISSING NAV: $name" -ForegroundColor Yellow
        }
    }

    if ($content -match 'href="members-area.html".*Members Portal') {
        Write-Host "WRONG MEMBERS PORTAL LINK: $name" -ForegroundColor Red
    }

    if ($content -match 'href="href=') {
        Write-Host "BROKEN HREF: $name" -ForegroundColor Red
    }

    if ($content -match 'href="members-login.html" features') {
        Write-Host "BAD TEXT LEFTOVER: $name" -ForegroundColor Red
    }

    $matches = [regex]::Matches($content, 'src="([^"]+)"')

    foreach ($m in $matches) {
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
            Write-Host "MISSING IMAGE/FILE in $name : $src" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Check complete."
Write-Host ""