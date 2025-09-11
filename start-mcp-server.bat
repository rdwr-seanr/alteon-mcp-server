@echo off
echo.
echo 🚀 Alteon MCP Server - Manual Testing Mode
echo ==========================================
echo.
echo This will start the MCP server and keep it running so you can
echo test it manually with LM Studio or other MCP clients.
echo.
echo Press Ctrl+C to stop the server when you're done testing.
echo.
echo Starting MCP server...
echo.

cd /d "%~dp0alteon-mcp-server"
node dist/index.js

echo.
echo 🛑 MCP Server stopped.
pause
