$filePath= "assets/wechaty.xlsx"
$filePath1= "assets/spider.xlsx"
$filePath2= "assets/shipping.xlsx"

echo "$(Get-Location)"

function Remove-FileIfExist {
  param (
    [string]$FilePath
  )

  

  if (Test-Path $FilePath) {
    Remove-Item -Path $FilePath
    Write-Host "File removed: $FilePath"
  } else {
    Write-Host "File not found: $FilePath"
  }
}

Remove-FileIfExist -FilePath $filePath
Remove-FileIfExist($filePath1)
Remove-FileIfExist($filePath2)

