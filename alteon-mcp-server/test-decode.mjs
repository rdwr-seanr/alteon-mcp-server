#!/usr/bin/env node

// Test port decoding and create better interface info
import axios from 'axios';
import https from 'https';

const client = axios.create({
  baseURL: 'https://10.210.240.23',
  auth: {
    username: 'admin',
    password: 'admin',
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: 10000,
});

// Function to decode hex port bitmask to port numbers
function decodePortBitmask(hexString) {
  // Remove colons and convert to binary
  const hex = hexString.replace(/:/g, '');
  const ports = [];
  
  // Each hex digit represents 4 bits, each bit represents a port
  for (let i = 0; i < hex.length; i++) {
    const hexDigit = parseInt(hex[i], 16);
    
    // Check each bit in this hex digit
    for (let bit = 0; bit < 4; bit++) {
      if (hexDigit & (1 << (3 - bit))) {
        // Calculate port number: (hex position * 4) + bit position + 1
        const portNum = (i * 4) + bit + 1;
        ports.push(portNum);
      }
    }
  }
  
  return ports;
}

async function testPortDecoding() {
  console.log('🔍 Testing port decoding and getting comprehensive info...\n');

  try {
    // Get VLAN info with decoded ports
    console.log('1. VLAN Configuration with decoded ports:');
    const vlanResponse = await client.get('/config/VlanNewCfgTable?count=5&props=VlanId,VlanName,Ports,State');
    
    if (vlanResponse.data.VlanNewCfgTable) {
      vlanResponse.data.VlanNewCfgTable.forEach(vlan => {
        const decodedPorts = decodePortBitmask(vlan.Ports);
        console.log(`   VLAN ${vlan.VlanId} (${vlan.VlanName}):`);
        console.log(`     Raw ports: ${vlan.Ports}`);
        console.log(`     Decoded ports: [${decodedPorts.join(', ')}]`);
        console.log(`     State: ${vlan.State === 2 ? 'Enabled' : 'Disabled'}`);
        console.log('');
      });
    }

    // Get interface/port information
    console.log('2. Interface Information:');
    const portResponse = await client.get('/config/PortInfoTable?count=8&props=Indx,Speed,Mode,Link,PhyIfDescr,PhyIfOperStatus,PhyIfPhysAddress');
    
    if (portResponse.data.PortInfoTable) {
      console.log('   Available Ports:');
      portResponse.data.PortInfoTable.forEach(port => {
        const speedMap = { 1: '10M', 2: '100M', 3: '1G', 4: '10G', 5: 'Auto' };
        const linkStatus = port.Link === 1 ? 'Down' : 'Up';
        const operStatus = port.PhyIfOperStatus === 1 ? 'Up' : 'Down';
        
        console.log(`     Port ${port.Indx}:`);
        console.log(`       Speed: ${speedMap[port.Speed] || port.Speed}`);
        console.log(`       Link: ${linkStatus}`);
        console.log(`       Operational: ${operStatus}`);
        console.log(`       Description: ${port.PhyIfDescr}`);
        console.log(`       MAC: ${port.PhyIfPhysAddress}`);
        console.log('');
      });
    }

    // Test system info with different approaches
    console.log('3. System Information:');
    try {
      // Try common system OIDs
      const sysOids = [
        'agSysName',
        'agSysLocation', 
        'agSysContact',
        'agSysVersion',
        'agSysBootVer',
        'agSysImage1Version',
        'agSysImage2Version'
      ];
      
      for (const oid of sysOids) {
        try {
          const response = await client.get(`/config?prop=${oid}`);
          if (response.data && response.data[oid]) {
            console.log(`   ${oid}: ${response.data[oid]}`);
          }
        } catch (e) {
          // Skip individual OID failures
        }
      }
    } catch (e) {
      console.log('   System info not available or different format');
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPortDecoding().catch(console.error);
