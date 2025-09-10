#!/usr/bin/env node

// Test VLAN table functionality
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testVlanTable() {
  console.log('Testing VLAN table retrieval...\n');
  
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  server.stdout.on('data', (data) => {
    const response = data.toString().trim();
    console.log('VLAN Table Response:');
    
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
  });
  
  server.stderr.on('data', (data) => {
    console.log('Server:', data.toString());
  });
  
  // Wait for server to start
  setTimeout(() => {
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
          "count": 5
        }
      }
    };
    
    server.stdin.write(JSON.stringify(vlanRequest) + '\n');
    
    setTimeout(() => {
      server.kill();
    }, 5000);
  }, 1000);
  
  server.on('close', (code) => {
    console.log('\nTest completed.');
  });
}

testVlanTable().catch(console.error);
