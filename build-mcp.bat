@echo off
echo Building Alteon MCP Server...
cd /d "C:\Users\SeanR\Documents\small-alteon-mcp\alteon-mcp-server"

echo Installing dependencies...
npm install

echo Building TypeScript...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo To test the MCP server:
    echo   node manual-test.mjs
    echo.
    echo To configure LM Studio, copy the contents of:
    echo   lm-studio-config.json
    echo.
    echo See SETUP-GUIDE.md for complete instructions.
    echo.
) else (
    echo.
    echo ❌ Build failed! Check the error messages above.
    echo.
)

pause
