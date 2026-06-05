$htmlFiles = Get-ChildItem -Path "c:\Users\hp\Desktop\cake\*.html"
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $content = $content -replace "navigator\.serviceWorker\.register\('/sw\.js'\)", "navigator.serviceWorker.register('sw.js')"
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Updated $($file.Name) to use relative sw.js"
}
