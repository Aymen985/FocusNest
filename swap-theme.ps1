# FocusNest theme swap - indigo to emerald
$files = Get-ChildItem -Recurse -Include *.tsx,*.ts,*.css | Where-Object { $_.FullName -notmatch "node_modules|\.next" }

$replacements = @(
  ,@("bg-indigo-500","bg-emerald-500")
  ,@("bg-indigo-600","bg-emerald-600")
  ,@("bg-indigo-400","bg-emerald-400")
  ,@("bg-indigo-950","bg-emerald-950")
  ,@("bg-indigo-100","bg-emerald-100")
  ,@("bg-indigo-50","bg-emerald-50")
  ,@("hover:bg-indigo-500","hover:bg-emerald-500")
  ,@("hover:bg-indigo-600","hover:bg-emerald-600")
  ,@("hover:bg-indigo-950","hover:bg-emerald-950")
  ,@("text-indigo-500","text-emerald-500")
  ,@("text-indigo-400","text-emerald-400")
  ,@("text-indigo-300","text-emerald-300")
  ,@("text-indigo-600","text-emerald-600")
  ,@("border-indigo-500","border-emerald-500")
  ,@("border-indigo-700","border-emerald-700")
  ,@("border-indigo-300","border-emerald-300")
  ,@("hover:border-indigo-700","hover:border-emerald-700")
  ,@("hover:border-indigo-300","hover:border-emerald-300")
  ,@("ring-indigo-500","ring-emerald-500")
  ,@("focus:border-indigo-500","focus:border-emerald-500")
  ,@("focus:ring-indigo-500","focus:ring-emerald-500")
  ,@("indigo-500/20","emerald-500/20")
  ,@("indigo-500/10","emerald-500/10")
  ,@("indigo-950","emerald-950")
  ,@("#6c63ff","#10b981")
  ,@("#6366f1","#10b981")
  ,@("#4f46e5","#059669")
  ,@("#5a52e0","#059669")
  ,@("group-hover:bg-indigo-50","group-hover:bg-emerald-50")
  ,@("group-hover:bg-indigo-950","group-hover:bg-emerald-950")
)

$totalFiles = 0

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -Encoding UTF8
  if (-not $content) { continue }
  $original = $content
  foreach ($pair in $replacements) {
    $content = $content -replace [regex]::Escape($pair[0]), $pair[1]
  }
  if ($content -ne $original) {
    Set-Content $file.FullName $content -Encoding UTF8 -NoNewline
    $totalFiles++
    Write-Host "Updated: $($file.FullName)"
  }
}

Write-Host ""
Write-Host "Done - $totalFiles files updated."
