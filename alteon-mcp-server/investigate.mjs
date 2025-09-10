#!/usr/bin/env node

// Direct investigation of Alteon API endpoints
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
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

async function investigateAlteon() {
  console.log('🔍 Investigating Alteon API endpoints...\n');

  try {
    // Test 1: Try to get system information with different OIDs
    console.log('1. Testing system information OIDs...');
    try {
      const sysResponse = await client.get('/config?prop=agSysName,agSysLocation,agSysContact');
      console.log('   System info result:', JSON.stringify(sysResponse.data, null, 2));
    } catch (e) {
      console.log('   System info failed:', e.response?.status, e.response?.data);
    }

    // Test 2: Try alternative system info
    console.log('\n2. Testing alternative system info...');
    try {
      const altSysResponse = await client.get('/config?prop=agSysVersion,agSysBootVer');
      console.log('   Alt system info result:', JSON.stringify(altSysResponse.data, null, 2));
    } catch (e) {
      console.log('   Alt system info failed:', e.response?.status, e.response?.data);
    }

    // Test 3: Explore different port/interface table names
    console.log('\n3. Testing different interface table names...');
    
    const interfaceTables = [
      'PortNewCfgTable',
      'PortCurCfgTable', 
      'PortInfoTable',
      'PortStatsTable',
      'IntfNewCfgTable',
      'IntfCurCfgTable'
    ];

    for (const table of interfaceTables) {
      try {
        const response = await client.get(`/config/${table}?count=2`);
        console.log(`   ✅ ${table} works:`, JSON.stringify(response.data, null, 2));
        break; // Stop at first working table
      } catch (e) {
        console.log(`   ❌ ${table} failed:`, e.response?.status);
      }
    }

    // Test 4: Get more detailed VLAN info to understand port format
    console.log('\n4. Getting detailed VLAN info...');
    try {
      const vlanResponse = await client.get('/config/VlanNewCfgTable?count=3&props=VlanId,VlanName,Ports,State');
      console.log('   VLAN detailed result:', JSON.stringify(vlanResponse.data, null, 2));
    } catch (e) {
      console.log('   VLAN detailed failed:', e.response?.status, e.response?.data);
    }

    // Test 5: Try to find port mapping or interface info
    console.log('\n5. Testing port information...');
    const portQueries = [
      '/config?prop=portMaxPorts,portCurCfgPortNum',
      '/config/PortCurCfgTable?count=5&props=Index,State,AdminStatus',
      '/config/PortNewCfgTable?count=5&props=Index,State,AdminStatus'
    ];

    for (const query of portQueries) {
      try {
        const response = await client.get(query);
        console.log(`   ✅ Query "${query}" works:`, JSON.stringify(response.data, null, 2));
      } catch (e) {
        console.log(`   ❌ Query "${query}" failed:`, e.response?.status);
      }
    }

  } catch (error) {
    console.error('Investigation failed:', error.message);
  }
}

investigateAlteon().catch(console.error);
