@echo off
cd /d "%~dp0"

echo ================================
echo  Kamiichi Miracles - Deploy
echo ================================
echo.

call npm run deploy

echo.
echo ================================
echo  Done. Check above for errors.
echo ================================
pause
