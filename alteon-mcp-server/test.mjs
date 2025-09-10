#!/usr/bin/env node

// Simple test script to verify MCP server functionality
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the MCP server by calling it directly
async function testMCPServer() {
  console.log('Testing Alteon MCP Server...\n');
  
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  console.log(`Starting MCP server: ${serverPath}\n`);
  
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Test 1: List available tools
  console.log('Test 1: Listing available tools...');
  const listToolsRequest = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  };
  
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  
  // Test 2: Get system info (you can manually test this)
  console.log('Test 2: Testing get_system_info tool...');
  const getSystemInfoRequest = {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_system_info",
      "arguments": {
        "ip": "10.210.240.23",
        "username": "admin",
        "password": "admin"
      }
    }
  };
  
  // Uncomment the line below to test with your actual Alteon device
  // server.stdin.write(JSON.stringify(getSystemInfoRequest) + '\n');
  
  server.stdout.on('data', (data) => {
    console.log('Server response:', data.toString());
  });
  
  server.stderr.on('data', (data) => {
    console.log('Server stderr:', data.toString());
  });
  
  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });
  
  // Let it run for a few seconds then kill it
  setTimeout(() => {
    console.log('\nStopping test server...');
    server.kill();
  }, 3000);
}

testMCPServer().catch(console.error);
