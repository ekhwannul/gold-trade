@echo off
echo Installing MT5 Bridge Dependencies...
py -m pip install -r requirements-mt5.txt

echo.
echo Starting MT5 Bridge Server...
echo Make sure MT5 is running!
echo.
py mt5_bridge.py

pause
