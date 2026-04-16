# Repair UTF-8 encoding for all tsx/ts files corrupted by PowerShell
# Run from project root: powershell -ExecutionPolicy Bypass -File .\fix-encoding.ps1

$files = Get-ChildItem -Recurse -Include *.tsx,*.ts,*.css |
  Where-Object { $_.FullName -notmatch "node_modules|\.next" }

$fixed = 0
foreach ($file in $files) {
  try {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    # Check for UTF-8 BOM (EF BB BF) added by PowerShell Set-Content
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
      # Strip BOM - write bytes starting from index 3
      $noBom = $bytes[3..($bytes.Length-1)]
      [System.IO.File]::WriteAllBytes($file.FullName, $noBom)
      $fixed++
      Write-Host "Fixed BOM: $($file.Name)"
    }
    # Re-encode as clean UTF-8 without BOM
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
  } catch {
    Write-Host "Skipped (unreadable): $($file.Name)"
  }
}

Write-Host "Done - $fixed files had BOM stripped."
