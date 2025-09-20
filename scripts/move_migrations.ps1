param(
  [string]$Root = "C:\Users\disha\Documents\GitHub\TheGridHub\supabase\migrations"
)

$archive = Join-Path $Root "_archive"
New-Item -ItemType Directory -Path $archive -Force | Out-Null

$files = Get-ChildItem $Root -File -Filter *.sql | Where-Object { $_.Name -ne '20250921_baseline.sql' }
foreach ($f in $files) {
  Move-Item -LiteralPath $f.FullName -Destination $archive -Force
}

Write-Host "Moved $($files.Count) migration files to _archive"
