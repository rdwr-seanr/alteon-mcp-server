#!/usr/bin/env node

// Test the improved MCP server with better formatting
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testImprovedMCP() {
  console.log('🧪 Testing improved MCP server with better formatting...\n');
  
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let testCount = 0;
  
  server.stdout.on('data', (data) => {
    const response = data.toString().trim();
    console.log(`=== Test ${++testCount} Response ===`);
    
    try {
      const jsonResponse = JSON.parse(response);
      if (jsonResponse.result && jsonResponse.result.content) {
        console.log(jsonResponse.result.content[0].text);
      } else {
        console.log(JSON.stringify(jsonResponse, null, 2));
      }
    } catch (e) {
      console.log(response);
    }
    console.log('\n');
  });
  
  server.stderr.on('data', (data) => {
    console.log('Server:', data.toString());
  });
  
  // Wait for server to start
  setTimeout(() => {
    console.log('Testing improved VLAN display...');
    const vlanRequest = {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "tools/call",
      "params": {
        "name": "get_vlan_table",
        "arguments": {
          "ip": "10.210.240.23",
          "username": "admin",
          "password": "admin",
          "count": 3
        }
      }
    };
    
    server.stdin.write(JSON.stringify(vlanRequest) + '\n');
    
    // Test interface stats after 3 seconds
    setTimeout(() => {
      console.log('Testing fixed interface stats...');
      const interfaceRequest = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
          "name": "get_interface_stats",
          "arguments": {
            "ip": "10.210.240.23",
            "username": "admin",
            "password": "admin",
            "count": 4
          }
        }
      };
      
      server.stdin.write(JSON.stringify(interfaceRequest) + '\n');
      
      // Stop after another 5 seconds
      setTimeout(() => {
        console.log('Stopping server...');
        server.kill();
      }, 5000);
    }, 3000);
  }, 1000);
  
  server.on('close', (code) => {
    console.log(`✅ Test completed. Server exited with code ${code}`);
  });
}

testImprovedMCP().catch(console.error);
