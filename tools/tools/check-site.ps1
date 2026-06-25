# Dudley Golf Club
# Checks common website issues without changing files

$projectRoot = Split-Path $PSScriptRoot -Parent
$htmlFiles = Get-ChildItem $projectRoot -Filter *.html

Write-Host ""
Write-Host "Dudley Golf Club Website Check"
Write-Host "================================"
Write-Host ""

foreach ($file in $htmlFiles) {

    $content = Get-Content $file.FullName -Raw
    $name = $file.Name

    if ($content -notmatch '<!-- MASTER FOOTER -->') {
        Write-Host "MISSING FOOTER: $name" -ForegroundColor Red
    }

    if ($content -notmatch '<nav') {
        Write-Host "MISSING NAV: $name" -ForegroundColor Yellow
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

    if ($content -match 'src="([^"]+)"') {
        $matches = [regex]::Matches($content, 'src="([^"]+)"')
        foreach ($m in $matches) {
            $src = $m.Groups[1].Value

            if ($src.StartsWith("http") -or $src.StartsWith("//") -or $src.StartsWith("data:")) {
                continue
            }

            $cleanSrc = $src.Split("?")[0]
            $path = Join-Path $projectRoot $cleanSrc

            if (-not (Test-Path $path)) {
                Write-Host "MISSING IMAGE/FILE in $name : $src" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host ""
Write-Host "Check complete."
Write-Host ""