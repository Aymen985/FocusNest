# Fix hardcoded dark backgrounds to be theme-aware
# Run from project root: powershell -ExecutionPolicy Bypass -File .\fix-bg.ps1

$files = Get-ChildItem -Recurse -Include *.tsx,*.ts | Where-Object { $_.FullName -notmatch "node_modules|\.next" }

$totalFiles = 0

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -Encoding UTF8
  if (-not $content) { continue }
  $original = $content

  # Fix: min-h-screen bg-neutral-950 without existing dark: prefix
  $content = $content -replace 'min-h-screen bg-neutral-950(?! dark:)', 'min-h-screen bg-white dark:bg-neutral-950'

  # Fix: auth layout hardcoded dark bg
  $content = $content -replace 'className="min-h-screen bg-neutral-950 flex', 'className="min-h-screen bg-white dark:bg-neutral-950 flex'

  if ($content -ne $original) {
    Set-Content $file.FullName $content -Encoding UTF8 -NoNewline
    $totalFiles++
    Write-Host "Fixed: $($file.FullName)"
  }
}

Write-Host ""
Write-Host "Done - $totalFiles files fixed."
