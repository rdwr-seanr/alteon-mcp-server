#!/usr/bin/env node

// Manual test script to test with actual Alteon device
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testWithAlteon() {
  console.log('Testing with actual Alteon device at 10.210.240.23...\n');
  
  const serverPath = path.join(__dirname, 'dist', 'index.js');
  
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let responseCount = 0;
  
  server.stdout.on('data', (data) => {
    const response = data.toString().trim();
    console.log(`Response ${++responseCount}:`);
    
    try {
      const jsonResponse = JSON.parse(response);
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log(response);
    }
    console.log('\n' + '='.repeat(80) + '\n');
  });
  
  server.stderr.on('data', (data) => {
    console.log('Server info:', data.toString());
  });
  
  // Wait a moment for server to start
  setTimeout(() => {
    console.log('Testing get_system_info...');
    const systemInfoRequest = {
      "jsonrpc": "2.0",
      "id": 1,
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
    
    server.stdin.write(JSON.stringify(systemInfoRequest) + '\n');
    
    // Test DNS config after 3 seconds
    setTimeout(() => {
      console.log('Testing get_dns_config...');
      const dnsConfigRequest = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
          "name": "get_dns_config",
          "arguments": {
            "ip": "10.210.240.23",
            "username": "admin",
            "password": "admin"
          }
        }
      };
      
      server.stdin.write(JSON.stringify(dnsConfigRequest) + '\n');
      
      // Stop after another 5 seconds
      setTimeout(() => {
        console.log('Test completed. Stopping server...');
        server.kill();
      }, 5000);
    }, 3000);
  }, 1000);
  
  server.on('close', (code) => {
    console.log(`Test completed. Server exited with code ${code}`);
  });
}

testWithAlteon().catch(console.error);
