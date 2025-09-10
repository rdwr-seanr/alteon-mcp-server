@echo off
echo.
echo 🔧 Alteon MCP Server - Build Script
echo =====================================
echo.

cd /d "%~dp0alteon-mcp-server"

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    goto :error
)

echo.
echo Building TypeScript...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    goto :error
)

echo.
echo ✅ Build successful!
echo.
echo Available commands:
echo   npm test          - Run test suite
echo   npm start         - Start MCP server
echo   node test.mjs     - Quick functionality test
echo.
echo 📚 Next steps:
echo   1. Review SETUP-GUIDE.md for LM Studio integration
echo   2. Update test.mjs with your Alteon device details
echo   3. Run 'npm test' to validate functionality
echo.
goto :end

:error
echo.
echo ❌ Build failed. Please check the error messages above.
echo.

:end
pause
