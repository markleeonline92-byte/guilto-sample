# Amruta Website — Image Setup Script
# Run this once to copy generated images into the /images/ folder
# Usage: Right-click in PowerShell → Run as Administrator, or double-click

$artifactsDir = "C:\Users\user\.gemini\antigravity-ide\brain\16dcd075-eb3e-422e-a73e-a8a450420b03"
$imagesDir    = "$PSScriptRoot\images"

if (!(Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
    Write-Host "Created images/ directory" -ForegroundColor Green
}

$mapping = @{
    "hero_product_platter_*.png" = "hero_platter.png"
    "about_artisan_*.png"        = "about_artisan.png"
    "gift_box_luxury_*.png"      = "gift_box.png"
    "ingredients_flatlay_*.png"  = "ingredients.png"
    "product_ladoo_*.png"        = "product_ladoo.png"
    "product_kaju_katli_*.png"   = "product_kaju_katli.png"
    "product_chocolate_*.png"    = "product_chocolate.png"
    "product_barfi_*.png"        = "product_barfi.png"
}

foreach ($pattern in $mapping.Keys) {
    $destName = $mapping[$pattern]
    $found = Get-ChildItem "$artifactsDir\$pattern" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        Copy-Item $found.FullName "$imagesDir\$destName" -Force
        Write-Host "  ✓ Copied $destName" -ForegroundColor Cyan
    } else {
        Write-Host "  ✗ Not found: $pattern" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Done! Open index.html in your browser." -ForegroundColor Green
Read-Host "Press Enter to exit"
