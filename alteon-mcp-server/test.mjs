#!/usr/bin/env node

/**
 * Test script for Alteon MCP Server
 * 
 * This script tests the MCP server functionality by:
 * 1. Starting the MCP server
 * 2. Testing VLAN table retrieval with port decoding
 * 3. Testing interface statistics
 * 4. Displaying formatted results
 * 
 * Usage: node test.mjs
 * 
 * Note: Update the IP, username, and password below for your Alteon device
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - Update these for your Alteon device
const ALTEON_CONFIG = {
  ip: "10.210.240.23",
  username: "admin", 
  password: "admin"
};

async function testAlteonMCP() {
  console.log('🧪 Testing Alteon MCP Server...\n');
  console.log(`Target Device: ${ALTEON_CONFIG.ip}\n`);
  
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
      if (jsonResponse.result?.content?.[0]?.text) {
        console.log(jsonResponse.result.content[0].text);
      } else if (jsonResponse.error) {
        console.log('❌ Error:', jsonResponse.error);
      } else {
        console.log(JSON.stringify(jsonResponse, null, 2));
      }
    } catch (e) {
      console.log(response);
    }
    console.log('\n');
  });
  
  server.stderr.on('data', (data) => {
    console.log('ℹ️ Server:', data.toString().trim());
  });
  
  // Wait for server to start
  setTimeout(() => {
    console.log('🔍 Testing VLAN configuration...');
    const vlanRequest = {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "tools/call",
      "params": {
        "name": "get_vlan_table",
        "arguments": {
          ...ALTEON_CONFIG,
          "count": 5
        }
      }
    };
    
    server.stdin.write(JSON.stringify(vlanRequest) + '\n');
    
    // Test interface stats after 3 seconds
    setTimeout(() => {
      console.log('🔍 Testing interface statistics...');
      const interfaceRequest = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
          "name": "get_interface_stats",
          "arguments": {
            ...ALTEON_CONFIG,
            "count": 4
          }
        }
      };
      
      server.stdin.write(JSON.stringify(interfaceRequest) + '\n');
      
      // Stop after 5 seconds
      setTimeout(() => {
        console.log('✅ Test completed. Stopping server...');
        server.kill();
      }, 5000);
    }, 3000);
  }, 1000);
  
  server.on('close', (code) => {
    console.log(`\n🎯 Test suite completed. Exit code: ${code || 'success'}`);
    console.log('\nIf tests passed, your MCP server is ready for production use!');
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testAlteonMCP().catch(console.error);
}
