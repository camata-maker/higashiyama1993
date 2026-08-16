@echo off
chcp 65001 > nul
echo.
echo ===================================
echo  index.html を素材フォルダに反映
echo ===================================
echo.

set SRC=%USERPROFILE%\Downloads\index.html
set DST=C:\Users\kmt55\Claude\Projects\50歳同窓会\素材\index.html

if not exist "%SRC%" (
  echo [エラー] Downloads\index.html が見つかりません。
  echo Claudeからダウンロードしてから実行してください。
  pause
  exit /b
)

copy /Y "%SRC%" "%DST%"

if %errorlevel% == 0 (
  echo.
  echo [完了] コピーしました：
  echo   %DST%
  echo.
  echo ブラウザで http://localhost:8080 を Ctrl+Shift+R で更新してください。
) else (
  echo [エラー] コピーに失敗しました。
)

pause
