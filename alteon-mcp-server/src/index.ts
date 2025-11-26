#!/usr/bin/env node

/**
 * Alteon MCP Server
 * 
 * A Model Context Protocol server for interacting with Alteon Application Delivery Controllers.
 * Provides AI assistants with tools to query and manage Alteon devices via REST API.
 * 
 * @author SeanR <seanramati95@gmail.com>
 * @version 1.7.0
 * @license MIT
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import https from "https";

// Interface for Alteon c               // Server state and status
              const stateMap: Record<string, string> = {
                '1': '🔴 Disabled',
                '2': '🟢 Enabled',
                '3': '⚪ Shutdown'
              };       // Server state and status
// Interface for connection parameters
interface AlteonConnection {
  ip: string;
  username: string;
  password: string;
}

// Function to decode hex port bitmask to readable port numbers
const decodePortBitmask = (hexString: string): number[] => {
  const hex = hexString.replace(/:/g, '');
  const ports: number[] = [];
  
  for (let i = 0; i < hex.length; i++) {
    const hexDigit = parseInt(hex[i], 16);
    
    for (let bit = 0; bit < 4; bit++) {
      if (hexDigit & (1 << (3 - bit))) {
        const portNum = (i * 4) + bit + 1;
        ports.push(portNum);
      }
    }
  }
  
  return ports;
};

// Function to format interface speed
const formatSpeed = (speed: number): string => {
  const speedMap: { [key: number]: string } = {
    1: '10M',
    2: '100M', 
    3: '1G',
    4: '10G',
    5: 'Auto'
  };
  return speedMap[speed] || `${speed}`;
};

// Function to format operational status
const formatStatus = (status: number): string => {
  return status === 1 ? 'Up' : 'Down';
};

// Create axios instance with SSL verification disabled (for lab environments)
const createAlteonClient = (connection: AlteonConnection) => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL verification for lab environments
  });

  return axios.create({
    baseURL: `https://${connection.ip}`,
    auth: {
      username: connection.username,
      password: connection.password,
    },
    httpsAgent,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
};

// Create the MCP server
const server = new Server(
  {
    name: "alteon-mcp-server",
    version: "1.7.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the tools available in this MCP server
const tools: Tool[] = [
  {
    name: "get_system_info",
    description: "Get basic system information from an Alteon device including hostname, version, and uptime",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_vlan_table",
    description: "Get VLAN configuration table from the Alteon device",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        count: {
          type: "number",
          description: "Number of VLAN entries to retrieve (optional, default 10)",
          default: 10,
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_dns_config",
    description: "Get DNS client configuration from the Alteon device",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_interface_stats",
    description: "Get interface/port information from the Alteon device including status, speed, and physical details",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        count: {
          type: "number",
          description: "Number of interface entries to retrieve (optional, default 8)",
          default: 8,
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_port_traffic_stats",
    description: "Get detailed port traffic statistics from the Alteon device including byte/packet counters, errors, and utilization",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        port: {
          type: "number",
          description: "Specific port number to retrieve stats for (optional, if not provided returns all ports)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_virtual_server_status",
    description: "Get virtual server configuration and status from the Alteon device, showing all configured virtual services with their details",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        server_index: {
          type: "string",
          description: "Specific virtual server index to retrieve (optional, if not provided returns all virtual servers)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_real_server_details",
    description: "Get comprehensive real server configuration and status from the Alteon device, including health status and proxy settings",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        server_index: {
          type: "string",
          description: "Specific real server index to retrieve (optional, if not provided returns all real servers)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_real_server_runtime_stats",
    description: "Get real-time runtime statistics and performance metrics for real servers, including availability status, health check configuration, and operational state",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        server_index: {
          type: "string",
          description: "Specific real server index to retrieve (optional, if not provided returns all real servers)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_service_groups",
    description: "Get all configured service groups (real server pools) from the Alteon device, including member servers, load balancing configuration, and health check settings",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        group_index: {
          type: "string",
          description: "Specific service group index/name to retrieve (optional, if not provided returns all groups)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_service_group_details",
    description: "Get detailed information about a specific service group including all member servers, their states, health check configuration, and load balancing settings",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        group_index: {
          type: "string",
          description: "Service group index/name to retrieve details for (required)",
        },
      },
      required: ["ip", "username", "password", "group_index"],
    },
  },
  {
    name: "get_ip_interfaces",
    description: "Get Layer 3 IP interface configuration including IP addresses, subnet masks, VLAN associations, and interface descriptions. Shows the network topology and Layer 3 connectivity.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        interface_index: {
          type: "string",
          description: "Specific interface index to retrieve (optional, if not provided returns all interfaces)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_vlan_details",
    description: "Get comprehensive VLAN information including enhanced VLAN configuration, port assignments, MTU, learning settings, and IPv6 configuration. More detailed than get_vlan_table.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        vlan_id: {
          type: "string",
          description: "Specific VLAN ID to retrieve (optional, if not provided returns all VLANs)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_network_summary",
    description: "Get a comprehensive network summary combining IP interfaces, VLANs, and their relationships. Provides a complete network topology view showing how Layer 2 and Layer 3 are configured.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_gateway_config",
    description: "Get gateway and static route configuration. Shows configured gateways and static routes for network routing topology.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "check_config_sync",
    description: "Check configuration synchronization status between new (pending) and current (active) configurations. Identifies any uncommitted changes that haven't been applied or saved.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "validate_server_config",
    description: "Validate real server configuration for common issues: duplicate IPs, port conflicts, invalid health check settings, weight misconfigurations, and best practice violations.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        server_index: {
          type: "string",
          description: "Specific server index to validate (optional, validates all if not provided)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "validate_service_group",
    description: "Validate service group configuration for issues: empty groups, all members down, mismatched health checks, unbalanced weights, and configuration problems.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        group_index: {
          type: "string",
          description: "Specific service group to validate (optional, validates all if not provided)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "generate_config_report",
    description: "Generate a comprehensive configuration audit report including device summary, resource utilization, configuration health, potential issues, and recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_virtual_service_details",
    description: "Get detailed information about virtual services (ports/protocols) configured on a virtual server. Shows service-specific settings including port, protocol, service group binding, and service state.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        vs_index: {
          type: "string",
          description: "Virtual server index to get services for (required)",
        },
      },
      required: ["ip", "username", "password", "vs_index"],
    },
  },
  {
    name: "get_virtual_server_runtime_stats",
    description: "Get real-time operational statistics for virtual servers including current connections, bytes/packets processed, and current state. Uses /oper/ endpoints for live data.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        vs_index: {
          type: "string",
          description: "Specific virtual server index (optional, if not provided returns all)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_virtual_service_runtime_stats",
    description: "Get real-time operational statistics for individual virtual services (per port/protocol on a VS). Shows per-service connections, throughput, and availability status.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        vs_index: {
          type: "string",
          description: "Virtual server index (required)",
        },
        service_index: {
          type: "string",
          description: "Service index/port (optional, if not provided returns all services for the VS)",
        },
      },
      required: ["ip", "username", "password", "vs_index"],
    },
  },
  {
    name: "get_real_server_operational_stats",
    description: "Get real-time operational statistics for real servers including current connections, bytes/packets processed, health check status, and operational state. Uses /oper/ endpoints for live monitoring data.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        server_index: {
          type: "string",
          description: "Specific real server index (optional, if not provided returns all)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_real_server_operational_info",
    description: "Get operational state information for real servers including up/down status, health check results, last failure reason, and current weight being used.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        server_index: {
          type: "string",
          description: "Specific real server index (optional, if not provided returns all)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_service_group_runtime_stats",
    description: "Get real-time operational statistics for service groups including total connections, throughput (bytes/packets), active server count, and load distribution. Uses /oper/ endpoints.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        group_index: {
          type: "string",
          description: "Specific service group index (optional, if not provided returns all)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_health_check_config",
    description: "Get health check definitions and configuration including check type, interval, timeout, retry count, success/failure thresholds, and which servers/groups use each health check.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        health_check_id: {
          type: "string",
          description: "Specific health check ID (optional, if not provided returns all)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
  {
    name: "get_health_check_results",
    description: "Get current health check operational results including last check time, success/failure status, failure reasons, and health check state for all monitored servers.",
    inputSchema: {
      type: "object",
      properties: {
        ip: {
          type: "string",
          description: "IP address of the Alteon device",
        },
        username: {
          type: "string",
          description: "Username for authentication",
        },
        password: {
          type: "string",
          description: "Password for authentication",
        },
        server_id: {
          type: "string",
          description: "Specific server ID to get health check results for (optional, returns all if not provided)",
        },
      },
      required: ["ip", "username", "password"],
    },
  },
];

// Handler for listing available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handler for tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("Missing arguments");
  }

  try {
    switch (name) {
      case "get_system_info": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };

        const client = createAlteonClient(connection);
        
        // Get system information using scalar properties
        const response = await client.get('/config?prop=agSysName,agSysLocation,agSysContact,agSysBootVer,agSysRunningVer');
        
        return {
          content: [
            {
              type: "text",
              text: `System Information for Alteon ${connection.ip}:\n\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "get_vlan_table": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const count = (args.count as number) || 10;

        const client = createAlteonClient(connection);
        
        // Get VLAN table information with enhanced formatting
        const response = await client.get(`/config/VlanNewCfgTable?count=${count}&props=State,VlanId,VlanName,Ports`);
        
        // Format the response with decoded ports
        let formattedOutput = `VLAN Configuration for Alteon ${connection.ip}:\n\n`;
        
        if (response.data.VlanNewCfgTable) {
          response.data.VlanNewCfgTable.forEach((vlan: any) => {
            const decodedPorts = decodePortBitmask(vlan.Ports);
            const status = vlan.State === 2 ? 'Enabled' : 'Disabled';
            
            formattedOutput += `VLAN ${vlan.VlanId}: ${vlan.VlanName}\n`;
            formattedOutput += `  Status: ${status}\n`;
            formattedOutput += `  Ports: [${decodedPorts.join(', ')}]\n`;
            formattedOutput += `  Raw Port Mask: ${vlan.Ports}\n\n`;
          });
        } else {
          formattedOutput += JSON.stringify(response.data, null, 2);
        }
        
        return {
          content: [
            {
              type: "text",
              text: formattedOutput,
            },
          ],
        };
      }

      case "get_dns_config": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };

        const client = createAlteonClient(connection);
        
        // Get DNS configuration using scalar properties (from the documentation example)
        const response = await client.get('/config?prop=dnsNewCfgPrimaryIpAddr,dnsNewCfgPrimaryIpv6Addr,dnsNewCfgSecondaryIpAddr,dnsNewCfgSecondaryIpv6Addr,dnsNewCfgDomainName');
        
        return {
          content: [
            {
              type: "text",
              text: `DNS Configuration for Alteon ${connection.ip}:\n\n${JSON.stringify(response.data, null, 2)}`,
            },
          ],
        };
      }

      case "get_interface_stats": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const count = (args.count as number) || 8;

        const client = createAlteonClient(connection);
        
        // Get interface information using PortInfoTable (which we know works)
        const response = await client.get(`/config/PortInfoTable?count=${count}&props=Indx,Speed,Mode,Link,PhyIfDescr,PhyIfOperStatus,PhyIfPhysAddress`);
        
        // Format the response in a readable way
        let formattedOutput = `Interface Configuration for Alteon ${connection.ip}:\n\n`;
        
        if (response.data.PortInfoTable) {
          response.data.PortInfoTable.forEach((port: any) => {
            const linkStatus = port.Link === 1 ? 'Down' : 'Up';
            const operStatus = formatStatus(port.PhyIfOperStatus);
            const speed = formatSpeed(port.Speed);
            
            formattedOutput += `Port ${port.Indx}:\n`;
            formattedOutput += `  Speed: ${speed}\n`;
            formattedOutput += `  Link Status: ${linkStatus}\n`;
            formattedOutput += `  Operational Status: ${operStatus}\n`;
            formattedOutput += `  Description: ${port.PhyIfDescr}\n`;
            formattedOutput += `  MAC Address: ${port.PhyIfPhysAddress}\n\n`;
          });
        } else {
          formattedOutput += JSON.stringify(response.data, null, 2);
        }
        
        return {
          content: [
            {
              type: "text",
              text: formattedOutput,
            },
          ],
        };
      }

      case "get_port_traffic_stats": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        
        const port = args.port as number | undefined;
        
        const client = createAlteonClient(connection);
        
        // Get port traffic statistics
        const response = await client.get('/config/PortStatsTable');
        
        // Helper function to format bytes in human readable format
        const formatBytes = (bytes: number): string => {
          if (bytes === 0) return '0 B';
          const k = 1024;
          const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };
        
        // Helper function to format packet counts
        const formatPackets = (packets: number): string => {
          if (packets === 0) return '0';
          if (packets >= 1000000) return (packets / 1000000).toFixed(2) + 'M';
          if (packets >= 1000) return (packets / 1000).toFixed(2) + 'K';
          return packets.toString();
        };
        
        // Helper function to calculate utilization percentage (rough estimate)
        const calculateUtilization = (inOctets: number, outOctets: number): string => {
          const totalBytes = inOctets + outOctets;
          // Very rough calculation - would need time window for accurate percentage
          if (totalBytes > 100000000) return 'High';
          if (totalBytes > 10000000) return 'Medium';
          if (totalBytes > 1000000) return 'Low';
          return 'Very Low';
        };
        
        // Format the response
        let formattedOutput = `Port Traffic Statistics for Alteon ${connection.ip}:\n\n`;
        
        if (response.data.PortStatsTable) {
          const ports = response.data.PortStatsTable;
          
          // Filter by specific port if requested
          const portsToShow = port ? ports.filter((p: any) => p.Indx === port) : ports;
          
          if (portsToShow.length === 0) {
            formattedOutput += port ? `No data found for port ${port}\n` : 'No port statistics available\n';
          } else {
            portsToShow.forEach((portData: any) => {
              const utilization = calculateUtilization(portData.PhyIfInOctets, portData.PhyIfOutOctets);
              
              formattedOutput += `Port ${portData.Indx} Traffic Statistics:\n`;
              formattedOutput += `  📊 Traffic Volume:\n`;
              formattedOutput += `    Inbound:  ${formatBytes(portData.PhyIfInOctets)} (${formatPackets(portData.PhyIfInUcastPkts)} unicast pkts)\n`;
              formattedOutput += `    Outbound: ${formatBytes(portData.PhyIfOutOctets)} (${formatPackets(portData.PhyIfOutUcastPkts)} unicast pkts)\n`;
              formattedOutput += `    Utilization: ${utilization}\n`;
              
              formattedOutput += `  📦 Packet Breakdown:\n`;
              formattedOutput += `    IN  - Unicast: ${formatPackets(portData.PhyIfInUcastPkts)}, Broadcast: ${formatPackets(portData.PhyIfInBroadcastPkts)}, Multicast: ${formatPackets(portData.PhyIfInMcastPkts)}\n`;
              formattedOutput += `    OUT - Unicast: ${formatPackets(portData.PhyIfOutUcastPkts)}, Broadcast: ${formatPackets(portData.PhyIfOutBroadcastPkts)}, Multicast: ${formatPackets(portData.PhyIfOutMcastPkts)}\n`;
              
              formattedOutput += `  ⚠️  Errors & Discards:\n`;
              formattedOutput += `    IN  - Errors: ${portData.PhyIfInErrors}, Discards: ${portData.PhyIfInDiscards}, Unknown Protocols: ${portData.PhyIfInUnknownProtos}\n`;
              formattedOutput += `    OUT - Errors: ${portData.PhyIfOutErrors}, Discards: ${portData.PhyIfOutDiscards}, Queue Length: ${portData.PhyIfOutQLen}\n`;
              
              // Add health assessment
              const hasErrors = portData.PhyIfInErrors > 0 || portData.PhyIfOutErrors > 0;
              const hasDiscards = portData.PhyIfInDiscards > 0 || portData.PhyIfOutDiscards > 0;
              const hasQueueIssues = portData.PhyIfOutQLen > 0;
              
              let healthStatus = '✅ Healthy';
              if (hasErrors) healthStatus = '❌ Errors Detected';
              else if (hasDiscards) healthStatus = '⚠️ Discards Present';
              else if (hasQueueIssues) healthStatus = '⚠️ Queue Issues';
              
              formattedOutput += `  🏥 Health Status: ${healthStatus}\n\n`;
            });
          }
        } else {
          formattedOutput += 'No port statistics data available\n';
        }
        
        return {
          content: [
            {
              type: "text",
              text: formattedOutput,
            },
          ],
        };
      }

      case "get_virtual_server_status": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        
        const serverIndex = args.server_index as string | undefined;
        
        const client = createAlteonClient(connection);
        
        // Get virtual server configuration
        const response = await client.get('/config/SlbNewCfgEnhVirtServerTable');
        
        let formattedOutput = '🖥️ Virtual Server Status\n';
        formattedOutput += '=' .repeat(50) + '\n\n';
        
        if (response.data && response.data.SlbNewCfgEnhVirtServerTable) {
          const servers = response.data.SlbNewCfgEnhVirtServerTable;
          const serverArray = Array.isArray(servers) ? servers : [servers];
          
          // Check if array is empty or contains empty objects
          if (serverArray.length === 0 || (serverArray.length === 1 && Object.keys(serverArray[0]).length === 0)) {
            formattedOutput += 'No virtual servers configured\n';
          } else {
            // Filter by specific server index if provided
            const filteredServers = serverIndex 
              ? serverArray.filter(server => server.VirtServerIndex === serverIndex)
              : serverArray;
            
            if (filteredServers.length === 0) {
              formattedOutput += serverIndex 
                ? `No virtual server found with index: ${serverIndex}\n`
                : 'No virtual servers configured\n';
            } else {
              formattedOutput += `Found ${filteredServers.length} virtual server(s)\n\n`;
              
              filteredServers.forEach((server, index) => {
              formattedOutput += `📊 Virtual Server ${index + 1}:\n`;
              formattedOutput += `  🆔 Index: ${server.VirtServerIndex}\n`;
              formattedOutput += `  🌐 IP Address: ${server.VirtServerIpAddress}\n`;
              formattedOutput += `  📝 Name: ${server.VirtServerVname || 'N/A'}\n`;
              
              // Server state and status
              const stateMap: Record<string, string> = {
                '1': '� Disabled',
                '2': '� Enabled', 
                '3': '⚪ Shutdown'
              };
              formattedOutput += `  🎛️ State: ${stateMap[server.VirtServerState] || server.VirtServerState}\n`;
              
              // Load balancing method
              const dnameLbMethodMap: Record<string, string> = {
                '1': 'Round Robin',
                '2': 'Least Connections',
                '3': 'Weighted Round Robin',
                '4': 'Hash',
                '5': 'Weighted Least Connections'
              };
              formattedOutput += `  ⚖️ LB Method: ${dnameLbMethodMap[server.VirtServerDname] || server.VirtServerDname}\n`;
              
              // Source NAT and address type
              if (server.VirtServerSrcNetwork) {
                formattedOutput += `  🌐 Source Network: ${server.VirtServerSrcNetwork}\n`;
              }
              if (server.VirtServerIpVer) {
                const ipVersion = server.VirtServerIpVer === '1' ? 'IPv4' : 'IPv6';
                formattedOutput += `  📡 IP Version: ${ipVersion}\n`;
              }
              
              // Traffic management
              if (server.VirtServerWeight !== undefined) {
                formattedOutput += `  ⚖️ Weight: ${server.VirtServerWeight}\n`;
              }
              if (server.VirtServerAvail) {
                const availMap: Record<string, string> = {
                  '1': '✅ Available',
                  '2': '❌ Failed',
                  '3': '⚠️ Disabled'
                };
                formattedOutput += `  📈 Availability: ${availMap[server.VirtServerAvail] || server.VirtServerAvail}\n`;
              }
              
              // Service ports and protocols
              if (server.VirtServerUdpAge) {
                formattedOutput += `  ⏱️ UDP Age Timeout: ${server.VirtServerUdpAge}s\n`;
              }
              if (server.VirtServerTcpAge) {
                formattedOutput += `  ⏱️ TCP Age Timeout: ${server.VirtServerTcpAge}s\n`;
              }
              
              // SSL and security
              if (server.VirtServerCertName) {
                formattedOutput += `  🔒 SSL Certificate: ${server.VirtServerCertName}\n`;
              }
              if (server.VirtServerClsRST) {
                const rstState = server.VirtServerClsRST === '1' ? 'Enabled' : 'Disabled';
                formattedOutput += `  🔄 Close Reset: ${rstState}\n`;
              }
              
              formattedOutput += '\n';
            });
            }
          }
        } else {
          formattedOutput += 'No virtual server data available\n';
        }
        
        return {
          content: [
            {
              type: "text",
              text: formattedOutput,
            },
          ],
        };
      }

      case "get_real_server_details": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        
        const serverIndex = args.server_index as string | undefined;
        
        const client = createAlteonClient(connection);
        
        // Get both real server tables for comprehensive data
        const [configResponse, extResponse] = await Promise.all([
          client.get('/config/SlbNewCfgEnhRealServerTable'),
          client.get('/config/SlbNewCfgEnhRealServerSecondPartTable').catch(() => ({ data: null }))
        ]);
        
        let formattedOutput = '🖥️ Real Server Details\n';
        formattedOutput += '=' .repeat(50) + '\n\n';
        
        if (configResponse.data && configResponse.data.SlbNewCfgEnhRealServerTable) {
          const servers = configResponse.data.SlbNewCfgEnhRealServerTable;
          const serverArray = Array.isArray(servers) ? servers : [servers];
          
          // Get extended data if available
          let extServers = [];
          if (extResponse.data && extResponse.data.SlbNewCfgEnhRealServerSecondPartTable) {
            const extData = extResponse.data.SlbNewCfgEnhRealServerSecondPartTable;
            extServers = Array.isArray(extData) ? extData : [extData];
          }
          
          // Filter by specific server index if provided
          const filteredServers = serverIndex 
            ? serverArray.filter(server => server.Index === serverIndex)
            : serverArray;
          
          if (filteredServers.length === 0) {
            formattedOutput += serverIndex 
              ? `No real server found with index: ${serverIndex}\n`
              : 'No real servers configured\n';
          } else {
            formattedOutput += `Found ${filteredServers.length} real server(s)\n\n`;
            
            filteredServers.forEach((server, index) => {
              // Find corresponding extended data
              const extServer = extServers.find(ext => ext.Index === server.Index);
              
              formattedOutput += `🖥️ Real Server ${index + 1}:\n`;
              formattedOutput += `  🆔 Index: ${server.Index}\n`;
              formattedOutput += `  🌐 IP Address: ${server.IpAddr}\n`;
              formattedOutput += `  📝 Name: ${server.Index}\n`;  // Using index as name for now
              
              // Server state and status
              const stateMap: Record<string, string> = {
                '1': '� Disabled',
                '2': '� Enabled',
                '3': '⚪ Shutdown'
              };
              formattedOutput += `  🎛️ State: ${stateMap[server.State] || server.State}\n`;
              
              // Health monitoring
              if (server.Weight !== undefined) {
                formattedOutput += `  ⚖️ Weight: ${server.Weight}\n`;
              }
              if (server.MaxConns !== undefined) {
                formattedOutput += `  🔗 Max Connections: ${server.MaxConns}\n`;
              }
              
              // Timeouts and thresholds
              if (server.TimeOut !== undefined) {
                formattedOutput += `  ⏱️ Timeout: ${server.TimeOut}s\n`;
              }
              if (server.FailRetry !== undefined) {
                formattedOutput += `  🔄 Fail Retry: ${server.FailRetry}\n`;
              }
              if (server.SuccRetry !== undefined) {
                formattedOutput += `  ✅ Success Retry: ${server.SuccRetry}\n`;
              }
              
              // Health check configuration
              if (server.PingInterval !== undefined) {
                formattedOutput += `  💓 Ping Interval: ${server.PingInterval}s\n`;
              }
              
              // Server type and delete status
              const typeMap: Record<string, string> = {
                '1': '🏠 Local Server',
                '2': '🌐 Remote Server'
              };
              if (server.Type) {
                formattedOutput += `  📍 Type: ${typeMap[server.Type] || server.Type}\n`;
              }
              
              const deleteStatusMap: Record<string, string> = {
                '1': '✅ Active',
                '2': '�️ Marked for Deletion'
              };
              if (server.DeleteStatus) {
                formattedOutput += `  �️ Status: ${deleteStatusMap[server.DeleteStatus] || server.DeleteStatus}\n`;
              }
              
              // Extended data from second table if available
              if (extServer) {
                const availMap: Record<string, string> = {
                  '1': '✅ Available',
                  '2': '❌ Failed',
                  '3': '⚠️ Disabled'
                };
                if (extServer.Avail) {
                  formattedOutput += `  � Availability: ${availMap[extServer.Avail] || extServer.Avail}\n`;
                }
                
                const proxyMap: Record<string, string> = {
                  '1': '� Enabled',
                  '2': '� Disabled'
                };
                if (extServer.Proxy) {
                  formattedOutput += `  � Proxy: ${proxyMap[extServer.Proxy] || extServer.Proxy}\n`;
                }
                
                const fastHealthMap: Record<string, string> = {
                  '1': '⚡ Enabled',
                  '2': '🐌 Disabled'
                };
                if (extServer.FastHealthCheck) {
                  formattedOutput += `  🏥 Fast Health Check: ${fastHealthMap[extServer.FastHealthCheck] || extServer.FastHealthCheck}\n`;
                }
                
                if (extServer.Idsvlan !== undefined) {
                  formattedOutput += `  🛡️ IDS VLAN: ${extServer.Idsvlan}\n`;
                }
              }
              
              formattedOutput += '\n';
            });
          }
        } else {
          formattedOutput += 'No real server data available\n';
        }
        
        return {
          content: [
            {
              type: "text",
              text: formattedOutput,
            },
          ],
        };
      }

      case "get_real_server_runtime_stats": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        
        const serverIndex = args.server_index as string | undefined;
        
        const client = createAlteonClient(connection);
        
        // Get comprehensive data from multiple tables
        const [configResponse, currentResponse, extResponse] = await Promise.all([
          client.get('/config/SlbNewCfgEnhRealServerTable'),
          client.get('/config/SlbCurCfgEnhRealServerTable'),
          client.get('/config/SlbNewCfgEnhRealServerSecondPartTable').catch(() => ({ data: null }))
        ]);
        
        let formattedOutput = '📊 Real Server Runtime Statistics\n';
        formattedOutput += '=' .repeat(70) + '\n\n';
        
        if (configResponse.data && configResponse.data.SlbNewCfgEnhRealServerTable) {
          const servers = configResponse.data.SlbNewCfgEnhRealServerTable;
          const serverArray = Array.isArray(servers) ? servers : [servers];
          
          // Get current running config
          let currentServers = [];
          if (currentResponse.data && currentResponse.data.SlbCurCfgEnhRealServerTable) {
            const currentData = currentResponse.data.SlbCurCfgEnhRealServerTable;
            currentServers = Array.isArray(currentData) ? currentData : [currentData];
          }
          
          // Get extended data
          let extServers = [];
          if (extResponse.data && extResponse.data.SlbNewCfgEnhRealServerSecondPartTable) {
            const extData = extResponse.data.SlbNewCfgEnhRealServerSecondPartTable;
            extServers = Array.isArray(extData) ? extData : [extData];
          }
          
          // Filter by specific server index if provided
          const filteredServers = serverIndex 
            ? serverArray.filter(server => server.Index === serverIndex)
            : serverArray;
          
          if (filteredServers.length === 0) {
            formattedOutput += serverIndex 
              ? `No real server found with index: ${serverIndex}\n`
              : 'No real servers configured\n';
          } else {
            formattedOutput += `📈 Monitoring ${filteredServers.length} real server(s)\n`;
            formattedOutput += `⏰ Timestamp: ${new Date().toISOString()}\n\n`;
            
            filteredServers.forEach((server, index) => {
              // Find corresponding current and extended data
              const currentServer = currentServers.find(cs => cs.Index === server.Index);
              const extServer = extServers.find(ext => ext.Index === server.Index);
              
              formattedOutput += `${'='.repeat(70)}\n`;
              formattedOutput += `🖥️  Real Server ${index + 1} (Index: ${server.Index})\n`;
              formattedOutput += `${'='.repeat(70)}\n\n`;
              
              // Basic Information
              formattedOutput += `📍 BASIC INFORMATION:\n`;
              formattedOutput += `   IP Address: ${server.IpAddr}\n`;
              formattedOutput += `   IP Version: ${server.IpVer === 1 ? 'IPv4' : 'IPv6'}\n`;
              if (server.Name && server.Name.trim()) {
                formattedOutput += `   Name: ${server.Name}\n`;
              }
              
              // Operational State
              formattedOutput += `\n🎛️  OPERATIONAL STATE:\n`;
              const stateMap: Record<string, string> = {
                '1': '🔴 Disabled',
                '2': '🟢 Enabled',
                '3': '⚪ Shutdown'
              };
              formattedOutput += `   Admin State: ${stateMap[server.State] || server.State}\n`;
              
              // Availability Status (from extended table)
              if (extServer && extServer.Avail) {
                const availMap: Record<string, string> = {
                  '1': '✅ Available (Healthy)',
                  '2': '❌ Failed (Unhealthy)',
                  '3': '⚠️  Administratively Disabled'
                };
                formattedOutput += `   Health Status: ${availMap[extServer.Avail] || extServer.Avail}\n`;
              }
              
              const deleteStatusMap: Record<string, string> = {
                '1': '✅ Active',
                '2': '🗑️  Pending Deletion'
              };
              formattedOutput += `   Delete Status: ${deleteStatusMap[server.DeleteStatus] || server.DeleteStatus}\n`;
              
              // Load Balancing Configuration
              formattedOutput += `\n⚖️  LOAD BALANCING:\n`;
              formattedOutput += `   Weight: ${server.Weight}\n`;
              formattedOutput += `   Max Connections: ${server.MaxConns === 0 ? 'Unlimited' : server.MaxConns}\n`;
              
              const typeMap: Record<string, string> = {
                '1': 'Local Server',
                '2': 'Remote Server'
              };
              formattedOutput += `   Server Type: ${typeMap[server.Type] || server.Type}\n`;
              
              // Health Check Configuration
              formattedOutput += `\n🏥 HEALTH CHECK CONFIGURATION:\n`;
              formattedOutput += `   Timeout: ${server.TimeOut}s\n`;
              formattedOutput += `   Ping Interval: ${server.PingInterval === 0 ? 'Disabled' : server.PingInterval + 's'}\n`;
              formattedOutput += `   Failure Retry: ${server.FailRetry === 0 ? 'Default' : server.FailRetry}\n`;
              formattedOutput += `   Success Retry: ${server.SuccRetry === 0 ? 'Default' : server.SuccRetry}\n`;
              
              if (extServer) {
                const fastHealthMap: Record<string, string> = {
                  '1': '⚡ Enabled',
                  '2': '🐌 Disabled'
                };
                if (extServer.FastHealthCheck) {
                  formattedOutput += `   Fast Health Check: ${fastHealthMap[extServer.FastHealthCheck] || extServer.FastHealthCheck}\n`;
                }
              }
              
              // Advanced Configuration
              if (extServer) {
                formattedOutput += `\n🔧 ADVANCED CONFIGURATION:\n`;
                
                const proxyMap: Record<string, string> = {
                  '1': '🔀 Enabled',
                  '2': '➡️  Disabled'
                };
                formattedOutput += `   Proxy Mode: ${proxyMap[extServer.Proxy] || extServer.Proxy}\n`;
                
                if (extServer.ProxyIpAddr && extServer.ProxyIpAddr !== '0.0.0.0') {
                  formattedOutput += `   Proxy IP: ${extServer.ProxyIpAddr}\n`;
                  formattedOutput += `   Proxy Mask: ${extServer.ProxyIpMask}\n`;
                }
                
                const modeMap: Record<string, string> = {
                  '1': 'NAT',
                  '2': 'Transparent',
                  '3': 'DSR'
                };
                if (extServer.Mode) {
                  formattedOutput += `   Forwarding Mode: ${modeMap[extServer.Mode] || extServer.Mode}\n`;
                }
                
                if (extServer.Idsvlan && extServer.Idsvlan !== 0) {
                  formattedOutput += `   IDS VLAN: ${extServer.Idsvlan}\n`;
                }
                
                if (extServer.Ingvlan && extServer.Ingvlan !== 0) {
                  formattedOutput += `   Ingress VLAN: ${extServer.Ingvlan}\n`;
                }
              }
              
              // Session Persistence
              if (server.Cookie) {
                formattedOutput += `\n🍪 SESSION PERSISTENCE:\n`;
                const cookieMap: Record<string, string> = {
                  '1': '✅ Enabled',
                  '2': '❌ Disabled'
                };
                formattedOutput += `   Cookie: ${cookieMap[server.Cookie] || server.Cookie}\n`;
              }
              
              // Configuration Sync Status
              formattedOutput += `\n🔄 CONFIGURATION STATUS:\n`;
              const configMatch = currentServer && 
                currentServer.IpAddr === server.IpAddr &&
                currentServer.State === server.State &&
                currentServer.Weight === server.Weight;
              
              formattedOutput += `   Config Synced: ${configMatch ? '✅ Yes' : '⚠️  Pending Apply'}\n`;
              
              if (currentServer && !configMatch) {
                formattedOutput += `   ⚠️  Configuration changes detected - apply pending\n`;
              }
              
              formattedOutput += '\n';
            });
            
            // Summary
            formattedOutput += `${'='.repeat(70)}\n`;
            formattedOutput += `📊 SUMMARY\n`;
            formattedOutput += `${'='.repeat(70)}\n`;
            
            const enabledCount = filteredServers.filter(s => s.State === 2).length;
            const disabledCount = filteredServers.filter(s => s.State === 1).length;
            
            let healthyCount = 0;
            let unhealthyCount = 0;
            filteredServers.forEach(s => {
              const extServer = extServers.find(ext => ext.Index === s.Index);
              if (extServer) {
                if (extServer.Avail === 1) healthyCount++;
                else if (extServer.Avail === 2) unhealthyCount++;
              }
            });
            
            formattedOutput += `\nTotal Servers: ${filteredServers.length}\n`;
            formattedOutput += `Admin State: ${enabledCount} Enabled, ${disabledCount} Disabled\n`;
            if (healthyCount + unhealthyCount > 0) {
              formattedOutput += `Health Status: ${healthyCount} Healthy, ${unhealthyCount} Unhealthy\n`;
            }
            
            // Overall health assessment
            if (unhealthyCount > 0) {
              formattedOutput += `\n⚠️  ALERT: ${unhealthyCount} server(s) reporting unhealthy status!\n`;
            } else if (enabledCount === filteredServers.length && healthyCount === filteredServers.length) {
              formattedOutput += `\n✅ All monitored servers are enabled and healthy\n`;
            }
          }
        } else {
          formattedOutput += 'No real server data available\n';
        }
        
        return {
          content: [
            {
              type: "text",
              text: formattedOutput,
            },
          ],
        };
      }

      case "get_service_groups": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        
        const groupIndex = args.group_index as string | undefined;
        
        const client = createAlteonClient(connection);
        
        // Get service group data and member servers
        const [groupsResponse, currentGroupsResponse, memberServersResponse, realServersResponse] = await Promise.all([
          client.get('/config/SlbNewCfgEnhGroupTable'),
          client.get('/config/SlbCurCfgEnhGroupTable'),
          client.get('/config/SlbNewCfgEnhGroupRealServerTable'),
          client.get('/config/SlbNewCfgEnhRealServerTable')
        ]);
        
        let formattedOutput = '🔄 Service Groups Overview\n';
        formattedOutput += '=' .repeat(70) + '\n\n';
        
        if (groupsResponse.data && groupsResponse.data.SlbNewCfgEnhGroupTable) {
          const groups = groupsResponse.data.SlbNewCfgEnhGroupTable;
          const groupArray = Array.isArray(groups) ? groups : [groups];
          
          // Get current groups
          let currentGroups = [];
          if (currentGroupsResponse.data && currentGroupsResponse.data.SlbCurCfgEnhGroupTable) {
            const currentData = currentGroupsResponse.data.SlbCurCfgEnhGroupTable;
            currentGroups = Array.isArray(currentData) ? currentData : [currentData];
          }
          
          // Get member servers
          let memberServers = [];
          if (memberServersResponse.data && memberServersResponse.data.SlbNewCfgEnhGroupRealServerTable) {
            const memberData = memberServersResponse.data.SlbNewCfgEnhGroupRealServerTable;
            memberServers = Array.isArray(memberData) ? memberData : [memberData];
          }
          
          // Get real server details
          let realServers = [];
          if (realServersResponse.data && realServersResponse.data.SlbNewCfgEnhRealServerTable) {
            const rsData = realServersResponse.data.SlbNewCfgEnhRealServerTable;
            realServers = Array.isArray(rsData) ? rsData : [rsData];
          }
          
          // Filter by specific group if provided
          const filteredGroups = groupIndex 
            ? groupArray.filter(group => group.Index === groupIndex)
            : groupArray;
          
          if (filteredGroups.length === 0) {
            formattedOutput += groupIndex 
              ? `No service group found with index: ${groupIndex}\n`
              : 'No service groups configured\n';
          } else {
            formattedOutput += `📊 Found ${filteredGroups.length} service group(s)\n`;
            formattedOutput += `⏰ Timestamp: ${new Date().toISOString()}\n\n`;
            
            filteredGroups.forEach((group, index) => {
              formattedOutput += `${'='.repeat(70)}\n`;
              formattedOutput += `📦 Service Group ${index + 1}: ${group.Index}\n`;
              formattedOutput += `${'='.repeat(70)}\n\n`;
              
              // Basic Information
              formattedOutput += `📍 BASIC INFORMATION:\n`;
              formattedOutput += `   Group Index: ${group.Index}\n`;
              if (group.Name && group.Name.trim()) {
                formattedOutput += `   Group Name: ${group.Name}\n`;
              }
              
              // Group Type
              const typeMap: Record<string, string> = {
                '0': 'Default',
                '1': 'Service Group',
                '2': 'Router Group'
              };
              formattedOutput += `   Type: ${typeMap[group.Type] || group.Type}\n`;
              
              // Load Balancing Configuration
              formattedOutput += `\n⚖️  LOAD BALANCING:\n`;
              const metricMap: Record<string, string> = {
                '1': 'Round Robin',
                '2': 'Least Connections',
                '3': 'Min Misses',
                '4': 'Hash',
                '5': 'Response Time',
                '6': 'Bandwidth',
                '7': 'Phash'
              };
              formattedOutput += `   Metric: ${metricMap[group.Metric] || group.Metric}\n`;
              
              const rmetricMap: Record<string, string> = {
                '1': 'Round Robin',
                '2': 'Hash'
              };
              formattedOutput += `   Reverse Metric: ${rmetricMap[group.Rmetric] || group.Rmetric}\n`;
              
              // Health Check Configuration
              formattedOutput += `\n🏥 HEALTH CHECK:\n`;
              formattedOutput += `   Health Check ID: ${group.HealthID}\n`;
              
              const healthLayerMap: Record<string, string> = {
                '1': 'ICMP (Layer 3)',
                '2': 'TCP (Layer 4)',
                '3': 'HTTP (Layer 7)',
                '4': 'HTTPS'
              };
              formattedOutput += `   Health Check Layer: ${healthLayerMap[group.HealthCheckLayer] || group.HealthCheckLayer}\n`;
              
              if (group.HealthCheckUrl && group.HealthCheckUrl.trim()) {
                formattedOutput += `   Health Check URL: ${group.HealthCheckUrl}\n`;
              }
              
              const vipHealthMap: Record<string, string> = {
                '1': '🔴 Disabled',
                '2': '🟢 Enabled'
              };
              formattedOutput += `   VIP Health Check: ${vipHealthMap[group.VipHealthCheck] || group.VipHealthCheck}\n`;
              
              // Thresholds
              formattedOutput += `\n📊 THRESHOLDS:\n`;
              formattedOutput += `   Real Server Threshold: ${group.RealThreshold === 0 ? 'Not Set' : group.RealThreshold}\n`;
              formattedOutput += `   Min Threshold: ${group.MinThreshold}\n`;
              formattedOutput += `   Max Threshold: ${group.MaxThreshold}\n`;
              
              // Backup Configuration
              formattedOutput += `\n🔄 BACKUP CONFIGURATION:\n`;
              formattedOutput += `   Backup Type: ${group.Backup}\n`;
              if (group.BackupServer) {
                formattedOutput += `   Backup Server: ${group.BackupServer}\n`;
              }
              if (group.BackupGroup) {
                formattedOutput += `   Backup Group: ${group.BackupGroup}\n`;
              }
              if (group.SecBackupGroup) {
                formattedOutput += `   Secondary Backup Group: ${group.SecBackupGroup}\n`;
              }
              
              // Slow Start
              if (group.Slowstart > 0) {
                formattedOutput += `\n⏱️  SLOW START:\n`;
                formattedOutput += `   Enabled: ${group.Slowstart}s\n`;
              }
              
              // Member Servers
              const groupMembers = memberServers.filter(m => m.RealServGroupIndex === group.Index);
              formattedOutput += `\n👥 MEMBER SERVERS (${groupMembers.length}):\n`;
              
              if (groupMembers.length > 0) {
                groupMembers.forEach(member => {
                  const realServer = realServers.find(rs => rs.Index === member.ServIndex);
                  const stateMap: Record<string, string> = {
                    '1': '🔴 Disabled',
                    '2': '🟢 Enabled'
                  };
                  
                  if (realServer) {
                    formattedOutput += `   • Server ${member.ServIndex}: ${realServer.IpAddr} - ${stateMap[member.State] || member.State}\n`;
                  } else {
                    formattedOutput += `   • Server ${member.ServIndex}: ${stateMap[member.State] || member.State}\n`;
                  }
                });
              } else {
                formattedOutput += `   No member servers configured\n`;
              }
              
              // Configuration Sync Status
              const currentGroup = currentGroups.find(cg => cg.Index === group.Index);
              formattedOutput += `\n🔄 CONFIGURATION STATUS:\n`;
              const configMatch = currentGroup && 
                currentGroup.Metric === group.Metric &&
                currentGroup.HealthID === group.HealthID;
              
              formattedOutput += `   Config Synced: ${configMatch ? '✅ Yes' : '⚠️  Pending Apply'}\n`;
              
              formattedOutput += '\n';
            });
            
            // Summary
            formattedOutput += `${'='.repeat(70)}\n`;
            formattedOutput += `📊 SUMMARY\n`;
            formattedOutput += `${'='.repeat(70)}\n\n`;
            
            const totalGroups = filteredGroups.length;
            const totalMembers = memberServers.filter(m => 
              filteredGroups.some(g => g.Index === m.RealServGroupIndex)
            ).length;
            const activeMembers = memberServers.filter(m => 
              filteredGroups.some(g => g.Index === m.RealServGroupIndex) && m.State === 2
            ).length;
            
            formattedOutput += `Total Service Groups: ${totalGroups}\n`;
            formattedOutput += `Total Member Servers: ${totalMembers}\n`;
            formattedOutput += `Active Member Servers: ${activeMembers}\n`;
            formattedOutput += `Inactive Member Servers: ${totalMembers - activeMembers}\n`;
          }
        } else {
          formattedOutput += 'No service group data available\n';
        }
        
        return {
          content: [
            {
              type: "text",
              text: formattedOutput,
            },
          ],
        };
      }

      case "get_service_group_details": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        
        const groupIndex = args.group_index as string;
        
        if (!groupIndex) {
          throw new Error("group_index is required for get_service_group_details");
        }
        
        const client = createAlteonClient(connection);
        
        // Get comprehensive data for the specific group
        const [groupResponse, currentGroupResponse, memberServersResponse, currentMembersResponse, 
               realServersResponse, extRealServersResponse] = await Promise.all([
          client.get(`/config/SlbNewCfgEnhGroupTable`),
          client.get(`/config/SlbCurCfgEnhGroupTable`),
          client.get('/config/SlbNewCfgEnhGroupRealServerTable'),
          client.get('/config/SlbCurCfgEnhGroupRealServerTable'),
          client.get('/config/SlbNewCfgEnhRealServerTable'),
          client.get('/config/SlbNewCfgEnhRealServerSecondPartTable').catch(() => ({ data: null }))
        ]);
        
        let formattedOutput = '🔍 Service Group Detailed Analysis\n';
        formattedOutput += '=' .repeat(70) + '\n\n';
        
        if (groupResponse.data && groupResponse.data.SlbNewCfgEnhGroupTable) {
          const groups = groupResponse.data.SlbNewCfgEnhGroupTable;
          const groupArray = Array.isArray(groups) ? groups : [groups];
          const group = groupArray.find(g => g.Index === groupIndex);
          
          if (!group) {
            formattedOutput += `Service group '${groupIndex}' not found\n`;
          } else {
            // Get current group config
            let currentGroup = null;
            if (currentGroupResponse.data && currentGroupResponse.data.SlbCurCfgEnhGroupTable) {
              const currentData = currentGroupResponse.data.SlbCurCfgEnhGroupTable;
              const currentArray = Array.isArray(currentData) ? currentData : [currentData];
              currentGroup = currentArray.find(g => g.Index === groupIndex);
            }
            
            // Get member servers
            let memberServers = [];
            if (memberServersResponse.data && memberServersResponse.data.SlbNewCfgEnhGroupRealServerTable) {
              const memberData = memberServersResponse.data.SlbNewCfgEnhGroupRealServerTable;
              const memberArray = Array.isArray(memberData) ? memberData : [memberData];
              memberServers = memberArray.filter(m => m.RealServGroupIndex === groupIndex);
            }
            
            // Get current member servers
            let currentMembers = [];
            if (currentMembersResponse.data && currentMembersResponse.data.SlbCurCfgEnhGroupRealServerTable) {
              const currentData = currentMembersResponse.data.SlbCurCfgEnhGroupRealServerTable;
              const currentArray = Array.isArray(currentData) ? currentData : [currentData];
              currentMembers = currentArray.filter(m => m.RealServGroupIndex === groupIndex);
            }
            
            // Get real server details
            let realServers = [];
            if (realServersResponse.data && realServersResponse.data.SlbNewCfgEnhRealServerTable) {
              const rsData = realServersResponse.data.SlbNewCfgEnhRealServerTable;
              realServers = Array.isArray(rsData) ? rsData : [rsData];
            }
            
            // Get extended real server data
            let extRealServers = [];
            if (extRealServersResponse.data && extRealServersResponse.data.SlbNewCfgEnhRealServerSecondPartTable) {
              const extData = extRealServersResponse.data.SlbNewCfgEnhRealServerSecondPartTable;
              extRealServers = Array.isArray(extData) ? extData : [extData];
            }
            
            formattedOutput += `🎯 Service Group: ${group.Index}\n`;
            formattedOutput += `⏰ Timestamp: ${new Date().toISOString()}\n\n`;
            
            // GROUP CONFIGURATION
            formattedOutput += `${'='.repeat(70)}\n`;
            formattedOutput += `📦 GROUP CONFIGURATION\n`;
            formattedOutput += `${'='.repeat(70)}\n\n`;
            
            formattedOutput += `Index: ${group.Index}\n`;
            if (group.Name && group.Name.trim()) {
              formattedOutput += `Name: ${group.Name}\n`;
            }
            
            const typeMap: Record<string, string> = {
              '0': 'Default',
              '1': 'Service Group',
              '2': 'Router Group'
            };
            formattedOutput += `Type: ${typeMap[group.Type] || group.Type}\n`;
            
            // Load Balancing
            formattedOutput += `\n⚖️  Load Balancing Method:\n`;
            const metricMap: Record<string, string> = {
              '1': 'Round Robin',
              '2': 'Least Connections',
              '3': 'Min Misses',
              '4': 'Hash',
              '5': 'Response Time',
              '6': 'Bandwidth',
              '7': 'Phash'
            };
            formattedOutput += `   Primary: ${metricMap[group.Metric] || group.Metric}\n`;
            
            const rmetricMap: Record<string, string> = {
              '1': 'Round Robin',
              '2': 'Hash'
            };
            formattedOutput += `   Reverse: ${rmetricMap[group.Rmetric] || group.Rmetric}\n`;
            
            if (group.PhashMask && group.PhashMask !== '255.255.255.255') {
              formattedOutput += `   Phash Mask: ${group.PhashMask}\n`;
            }
            
            // Health Check Details
            formattedOutput += `\n🏥 Health Check Configuration:\n`;
            formattedOutput += `   Health Check ID: ${group.HealthID}\n`;
            
            const healthLayerMap: Record<string, string> = {
              '1': 'ICMP (Ping)',
              '2': 'TCP (Port Check)',
              '3': 'HTTP',
              '4': 'HTTPS'
            };
            formattedOutput += `   Layer: ${healthLayerMap[group.HealthCheckLayer] || group.HealthCheckLayer}\n`;
            
            if (group.HealthCheckUrl && group.HealthCheckUrl.trim()) {
              formattedOutput += `   URL: ${group.HealthCheckUrl}\n`;
            }
            
            if (group.HealthCheckFormula && group.HealthCheckFormula.trim()) {
              formattedOutput += `   Formula: ${group.HealthCheckFormula}\n`;
            }
            
            const vipHealthMap: Record<string, string> = {
              '1': '🔴 Disabled',
              '2': '🟢 Enabled'
            };
            formattedOutput += `   VIP Health Check: ${vipHealthMap[group.VipHealthCheck] || group.VipHealthCheck}\n`;
            
            // Thresholds and Limits
            formattedOutput += `\n📊 Thresholds:\n`;
            formattedOutput += `   Real Server Threshold: ${group.RealThreshold === 0 ? 'Not Set' : group.RealThreshold}\n`;
            formattedOutput += `   Min Threshold: ${group.MinThreshold}\n`;
            formattedOutput += `   Max Threshold: ${group.MaxThreshold}\n`;
            
            // Backup Configuration
            if (group.BackupServer || group.BackupGroup || group.SecBackupGroup) {
              formattedOutput += `\n🔄 Backup Configuration:\n`;
              formattedOutput += `   Type: ${group.Backup}\n`;
              if (group.BackupServer) {
                formattedOutput += `   Backup Server: ${group.BackupServer}\n`;
              }
              if (group.BackupGroup) {
                formattedOutput += `   Backup Group: ${group.BackupGroup}\n`;
              }
              if (group.SecBackupGroup) {
                formattedOutput += `   Secondary Backup Group: ${group.SecBackupGroup}\n`;
              }
            }
            
            // Slow Start
            if (group.Slowstart > 0) {
              formattedOutput += `\n⏱️  Slow Start: ${group.Slowstart} seconds\n`;
            }
            
            // MEMBER SERVERS
            formattedOutput += `\n${'='.repeat(70)}\n`;
            formattedOutput += `👥 MEMBER SERVERS (${memberServers.length})\n`;
            formattedOutput += `${'='.repeat(70)}\n\n`;
            
            if (memberServers.length > 0) {
              memberServers.forEach((member, idx) => {
                const realServer = realServers.find(rs => rs.Index === member.ServIndex);
                const extServer = extRealServers.find(ext => ext.Index === member.ServIndex);
                const currentMember = currentMembers.find(cm => cm.ServIndex === member.ServIndex);
                
                formattedOutput += `Server ${idx + 1}:\n`;
                formattedOutput += `   Index: ${member.ServIndex}\n`;
                
                if (realServer) {
                  formattedOutput += `   IP Address: ${realServer.IpAddr}\n`;
                  formattedOutput += `   Weight: ${realServer.Weight}\n`;
                  formattedOutput += `   Max Connections: ${realServer.MaxConns === 0 ? 'Unlimited' : realServer.MaxConns}\n`;
                  
                  const stateMap: Record<string, string> = {
                    '1': '🔴 Disabled',
                    '2': '🟢 Enabled'
                  };
                  formattedOutput += `   Admin State: ${stateMap[realServer.State] || realServer.State}\n`;
                  formattedOutput += `   Group Membership State: ${stateMap[member.State] || member.State}\n`;
                  
                  // Health check config
                  formattedOutput += `   Health Check Timeout: ${realServer.TimeOut}s\n`;
                  formattedOutput += `   Ping Interval: ${realServer.PingInterval === 0 ? 'Group Default' : realServer.PingInterval + 's'}\n`;
                  
                  if (extServer) {
                    const availMap: Record<string, string> = {
                      '1': '✅ Available',
                      '2': '❌ Failed',
                      '3': '⚠️  Disabled'
                    };
                    formattedOutput += `   Availability: ${availMap[extServer.Avail] || extServer.Avail}\n`;
                  }
                  
                  // Config sync for this member
                  const memberSync = currentMember && currentMember.State === member.State;
                  formattedOutput += `   Config Synced: ${memberSync ? '✅' : '⚠️  Pending'}\n`;
                }
                
                formattedOutput += '\n';
              });
            } else {
              formattedOutput += 'No member servers configured\n\n';
            }
            
            // SUMMARY AND HEALTH ASSESSMENT
            formattedOutput += `${'='.repeat(70)}\n`;
            formattedOutput += `📊 HEALTH ASSESSMENT\n`;
            formattedOutput += `${'='.repeat(70)}\n\n`;
            
            const totalMembers = memberServers.length;
            const enabledMembers = memberServers.filter(m => m.State === 2).length;
            const disabledMembers = memberServers.filter(m => m.State === 1).length;
            
            let availableMembers = 0;
            let failedMembers = 0;
            
            memberServers.forEach(member => {
              const extServer = extRealServers.find(ext => ext.Index === member.ServIndex);
              if (extServer) {
                if (extServer.Avail === 1) availableMembers++;
                else if (extServer.Avail === 2) failedMembers++;
              }
            });
            
            formattedOutput += `Total Servers in Group: ${totalMembers}\n`;
            formattedOutput += `Enabled: ${enabledMembers} | Disabled: ${disabledMembers}\n`;
            
            if (availableMembers + failedMembers > 0) {
              formattedOutput += `Health Status: ${availableMembers} Available, ${failedMembers} Failed\n`;
            }
            
            // Overall assessment
            formattedOutput += `\n🎯 Group Status: `;
            if (totalMembers === 0) {
              formattedOutput += '⚠️  No members configured\n';
            } else if (failedMembers > 0) {
              formattedOutput += `⚠️  ${failedMembers} server(s) unhealthy\n`;
            } else if (enabledMembers === 0) {
              formattedOutput += '🔴 All servers disabled\n';
            } else if (enabledMembers === totalMembers && availableMembers === totalMembers) {
              formattedOutput += '✅ All servers healthy and operational\n';
            } else {
              formattedOutput += '🟡 Partial availability\n';
            }
            
            // Configuration sync status
            const groupSync = currentGroup && 
              currentGroup.Metric === group.Metric &&
              currentGroup.HealthID === group.HealthID;
            
            formattedOutput += `Configuration Status: ${groupSync ? '✅ Synced' : '⚠️  Changes pending apply'}\n`;
          }
        } else {
          formattedOutput += 'No service group data available\n';
        }
        
        return {
          content: [
            {
              type: "text",
              text: formattedOutput,
            },
          ],
        };
      }

      case "get_ip_interfaces": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const client = createAlteonClient(connection);
        
        const response = await client.get('/config/IpNewCfgIntfTable');
        const interfaces = response.data.IpNewCfgIntfTable;
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `🌐 LAYER 3 IP INTERFACES\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        if (interfaces && interfaces.length > 0) {
          const targetIndex = args.interface_index as string | undefined;
          const filteredInterfaces = targetIndex 
            ? interfaces.filter((intf: any) => intf.Index.toString() === targetIndex)
            : interfaces;
          
          filteredInterfaces.forEach((intf: any, idx: number) => {
            formattedOutput += `Interface ${idx + 1}:\n`;
            formattedOutput += `   Index: ${intf.Index}\n`;
            formattedOutput += `   IP Address: ${intf.Addr}\n`;
            formattedOutput += `   Subnet Mask: ${intf.Mask}\n`;
            formattedOutput += `   VLAN: ${intf.Vlan}\n`;
            
            const stateMap: Record<string, string> = {
              '1': '🔴 Disabled',
              '2': '🟢 Enabled'
            };
            formattedOutput += `   State: ${stateMap[intf.State] || intf.State}\n`;
            
            if (intf.Description) {
              formattedOutput += `   Description: ${intf.Description}\n`;
            }
            
            const ipVerMap: Record<string, string> = {
              '1': 'IPv4',
              '2': 'IPv6',
              '3': 'Both IPv4 and IPv6'
            };
            formattedOutput += `   IP Version: ${ipVerMap[intf.IpVer] || intf.IpVer}\n`;
            
            if (intf.Ipv6Addr && intf.Ipv6Addr !== '::' && intf.Ipv6Addr !== '0:0:0:0:0:0:0:0') {
              formattedOutput += `   IPv6 Address: ${intf.Ipv6Addr}/${intf.PrefixLen}\n`;
            }
            
            if (intf.Peer && intf.Peer !== '0.0.0.0') {
              formattedOutput += `   Peer IP: ${intf.Peer}\n`;
            }
            
            formattedOutput += `\n`;
          });
          
          formattedOutput += `${'='.repeat(70)}\n`;
          formattedOutput += `Total Interfaces: ${filteredInterfaces.length}\n`;
        } else {
          formattedOutput += 'No IP interfaces configured\n';
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_vlan_details": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const client = createAlteonClient(connection);
        
        const response = await client.get('/config/VlanNewCfgTable');
        const vlans = response.data.VlanNewCfgTable;
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `🏷️  VLAN CONFIGURATION DETAILS\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        if (vlans && vlans.length > 0) {
          const targetVlan = args.vlan_id as string | undefined;
          const filteredVlans = targetVlan
            ? vlans.filter((vlan: any) => vlan.VlanId.toString() === targetVlan)
            : vlans;
          
          filteredVlans.forEach((vlan: any, idx: number) => {
            formattedOutput += `VLAN ${idx + 1}:\n`;
            formattedOutput += `   VLAN ID: ${vlan.VlanId}\n`;
            formattedOutput += `   Name: ${vlan.VlanName}\n`;
            
            const stateMap: Record<string, string> = {
              '1': '🔴 Disabled',
              '2': '🟢 Enabled'
            };
            formattedOutput += `   State: ${stateMap[vlan.State] || vlan.State}\n`;
            
            // Port assignments
            const ports = decodePortBitmask(vlan.Ports);
            formattedOutput += `   Assigned Ports: ${ports.length > 0 ? `[${ports.join(', ')}]` : 'None'}\n`;
            formattedOutput += `   Raw Port Mask: ${vlan.Ports}\n`;
            
            // MTU configuration
            if (vlan.Mtu) {
              const mtuMap: Record<string, string> = {
                '1': 'Enabled',
                '2': 'Disabled'
              };
              formattedOutput += `   MTU Override: ${mtuMap[vlan.Mtu] || vlan.Mtu}\n`;
              if (vlan.MtuSize && vlan.Mtu === '1') {
                formattedOutput += `   MTU Size: ${vlan.MtuSize} bytes\n`;
              }
            }
            
            // Jumbo frames
            if (vlan.Jumbo) {
              const jumboMap: Record<string, string> = {
                '1': 'Enabled',
                '2': 'Disabled'
              };
              formattedOutput += `   Jumbo Frames: ${jumboMap[vlan.Jumbo] || vlan.Jumbo}\n`;
            }
            
            // MAC learning
            if (vlan.Learn) {
              const learnMap: Record<string, string> = {
                '1': 'Enabled',
                '2': 'Disabled'
              };
              formattedOutput += `   MAC Learning: ${learnMap[vlan.Learn] || vlan.Learn}\n`;
            }
            
            // Spanning tree group
            if (vlan.Stg && vlan.Stg !== '0') {
              formattedOutput += `   Spanning Tree Group: ${vlan.Stg}\n`;
            }
            
            // IPv6 configuration
            if (vlan.Ipv6LlaGen) {
              const ipv6GenMap: Record<string, string> = {
                '1': 'Enabled',
                '2': 'Disabled'
              };
              formattedOutput += `   IPv6 Link-Local Generation: ${ipv6GenMap[vlan.Ipv6LlaGen] || vlan.Ipv6LlaGen}\n`;
            }
            
            if (vlan.RouterAdv) {
              const raMap: Record<string, string> = {
                '1': 'Enabled',
                '2': 'Disabled'
              };
              formattedOutput += `   Router Advertisement: ${raMap[vlan.RouterAdv] || vlan.RouterAdv}\n`;
            }
            
            formattedOutput += `\n`;
          });
          
          formattedOutput += `${'='.repeat(70)}\n`;
          formattedOutput += `Total VLANs: ${filteredVlans.length}\n`;
        } else {
          formattedOutput += 'No VLANs configured\n';
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_network_summary": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const client = createAlteonClient(connection);
        
        // Get both IP interfaces and VLANs
        const [ipResponse, vlanResponse] = await Promise.all([
          client.get('/config/IpNewCfgIntfTable'),
          client.get('/config/VlanNewCfgTable')
        ]);
        
        const interfaces = ipResponse.data.IpNewCfgIntfTable;
        const vlans = vlanResponse.data.VlanNewCfgTable;
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `🌐 NETWORK TOPOLOGY SUMMARY\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        // Overview
        formattedOutput += `📊 Overview:\n`;
        formattedOutput += `   IP Interfaces: ${interfaces.length}\n`;
        formattedOutput += `   VLANs: ${vlans.length}\n`;
        formattedOutput += `\n`;
        
        // Group by VLAN
        formattedOutput += `${'='.repeat(70)}\n`;
        formattedOutput += `📋 VLAN-to-Interface Mapping:\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        vlans.forEach((vlan: any) => {
          const vlanInterfaces = interfaces.filter((intf: any) => intf.Vlan === vlan.VlanId);
          const ports = decodePortBitmask(vlan.Ports);
          
          formattedOutput += `VLAN ${vlan.VlanId}: ${vlan.VlanName}\n`;
          formattedOutput += `   State: ${vlan.State === 2 ? '🟢 Enabled' : '🔴 Disabled'}\n`;
          formattedOutput += `   Ports: ${ports.length > 0 ? `[${ports.join(', ')}]` : 'None'}\n`;
          
          if (vlanInterfaces.length > 0) {
            formattedOutput += `   Layer 3 Interfaces (${vlanInterfaces.length}):\n`;
            vlanInterfaces.forEach((intf: any) => {
              formattedOutput += `      • ${intf.Addr}/${intf.Mask}`;
              if (intf.Description) {
                formattedOutput += ` (${intf.Description})`;
              }
              formattedOutput += `\n`;
            });
          } else {
            formattedOutput += `   Layer 3 Interfaces: None (Layer 2 only)\n`;
          }
          formattedOutput += `\n`;
        });
        
        // Orphan check - interfaces not in any VLAN
        const vlanIds = vlans.map((v: any) => v.VlanId);
        const orphanInterfaces = interfaces.filter((intf: any) => !vlanIds.includes(intf.Vlan));
        
        if (orphanInterfaces.length > 0) {
          formattedOutput += `⚠️  Interfaces without matching VLAN:\n`;
          orphanInterfaces.forEach((intf: any) => {
            formattedOutput += `   • Interface ${intf.Index}: ${intf.Addr} (references VLAN ${intf.Vlan})\n`;
          });
          formattedOutput += `\n`;
        }
        
        formattedOutput += `${'='.repeat(70)}\n`;
        formattedOutput += `Summary: ${interfaces.length} L3 interfaces across ${vlans.length} VLANs\n`;
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_gateway_config": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const client = createAlteonClient(connection);
        
        // Try to get gateway and static route tables
        const [gwResponse, routeResponse] = await Promise.all([
          client.get('/config/IpNewCfgGwTable').catch(() => null),
          client.get('/config/IpNewCfgStaticRouteTable').catch(() => null)
        ]);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `🚪 GATEWAY AND ROUTING CONFIGURATION\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        let hasData = false;
        
        // Gateways
        if (gwResponse && gwResponse.data.IpNewCfgGwTable) {
          const gateways = gwResponse.data.IpNewCfgGwTable;
          
          if (Array.isArray(gateways) && gateways.length > 0) {
            formattedOutput += `🌐 Configured Gateways:\n\n`;
            gateways.forEach((gw: any, idx: number) => {
              formattedOutput += `Gateway ${idx + 1}:\n`;
              formattedOutput += `   Index: ${gw.Index}\n`;
              formattedOutput += `   IP Address: ${gw.IpAddr}\n`;
              if (gw.Vlan) formattedOutput += `   VLAN: ${gw.Vlan}\n`;
              if (gw.Interval) formattedOutput += `   Health Check Interval: ${gw.Interval}s\n`;
              if (gw.Retry) formattedOutput += `   Health Check Retries: ${gw.Retry}\n`;
              if (gw.State) {
                const stateMap: Record<string, string> = {
                  '1': '🔴 Disabled',
                  '2': '🟢 Enabled'
                };
                formattedOutput += `   State: ${stateMap[gw.State] || gw.State}\n`;
              }
              formattedOutput += `\n`;
            });
            hasData = true;
          }
        }
        
        // Static Routes
        if (routeResponse && routeResponse.data.IpNewCfgStaticRouteTable) {
          const routes = routeResponse.data.IpNewCfgStaticRouteTable;
          
          if (Array.isArray(routes) && routes.length > 0) {
            formattedOutput += `🗺️  Static Routes:\n\n`;
            routes.forEach((route: any, idx: number) => {
              formattedOutput += `Route ${idx + 1}:\n`;
              formattedOutput += `   Index: ${route.IndxStaticRouteIndx}\n`;
              formattedOutput += `   Destination: ${route.DestIp}\n`;
              formattedOutput += `   Subnet Mask: ${route.Mask}\n`;
              formattedOutput += `   Gateway: ${route.Gateway}\n`;
              if (route.Vlan) formattedOutput += `   VLAN: ${route.Vlan}\n`;
              if (route.Interface) formattedOutput += `   Interface: ${route.Interface}\n`;
              formattedOutput += `\n`;
            });
            hasData = true;
          }
        }
        
        if (!hasData) {
          formattedOutput += `ℹ️  No gateways or static routes configured\n`;
          formattedOutput += `\n`;
          formattedOutput += `This is normal for:\n`;
          formattedOutput += `   • Layer 2 only deployments\n`;
          formattedOutput += `   • Devices using default routing\n`;
          formattedOutput += `   • Configurations relying on VLAN interfaces only\n`;
        }
        
        formattedOutput += `\n${'='.repeat(70)}\n`;
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "check_config_sync": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const client = createAlteonClient(connection);
        
        // Compare New vs Current configurations
        const [newServers, curServers, newGroups, curGroups, newVlans, curVlans] = await Promise.all([
          client.get('/config/SlbNewCfgEnhRealServerTable'),
          client.get('/config/SlbCurCfgEnhRealServerTable'),
          client.get('/config/SlbNewCfgEnhGroupTable'),
          client.get('/config/SlbCurCfgEnhGroupTable'),
          client.get('/config/VlanNewCfgTable'),
          client.get('/config/VlanCurCfgTable')
        ]);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `🔄 CONFIGURATION SYNCHRONIZATION STATUS\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        let hasChanges = false;
        const changes: string[] = [];
        
        // Check real servers
        const newServerArray = newServers.data.SlbNewCfgEnhRealServerTable;
        const curServerArray = curServers.data.SlbCurCfgEnhRealServerTable;
        
        if (newServerArray.length !== curServerArray.length) {
          hasChanges = true;
          changes.push(`Real Servers: Count changed (${curServerArray.length} → ${newServerArray.length})`);
        } else {
          newServerArray.forEach((newSrv: any) => {
            const curSrv = curServerArray.find((c: any) => c.Index === newSrv.Index);
            if (curSrv) {
              if (newSrv.State !== curSrv.State) {
                hasChanges = true;
                changes.push(`Server ${newSrv.Index} (${newSrv.IpAddr}): State changed`);
              }
              if (newSrv.Weight !== curSrv.Weight) {
                hasChanges = true;
                changes.push(`Server ${newSrv.Index} (${newSrv.IpAddr}): Weight ${curSrv.Weight} → ${newSrv.Weight}`);
              }
            }
          });
        }
        
        // Check service groups
        const newGroupArray = newGroups.data.SlbNewCfgEnhGroupTable;
        const curGroupArray = curGroups.data.SlbCurCfgEnhGroupTable;
        
        if (newGroupArray.length !== curGroupArray.length) {
          hasChanges = true;
          changes.push(`Service Groups: Count changed (${curGroupArray.length} → ${newGroupArray.length})`);
        } else {
          newGroupArray.forEach((newGrp: any) => {
            const curGrp = curGroupArray.find((c: any) => c.Index === newGrp.Index);
            if (curGrp) {
              if (newGrp.Metric !== curGrp.Metric) {
                hasChanges = true;
                changes.push(`Group ${newGrp.Index}: Load balancing metric changed`);
              }
              if (newGrp.HealthID !== curGrp.HealthID) {
                hasChanges = true;
                changes.push(`Group ${newGrp.Index}: Health check changed`);
              }
            }
          });
        }
        
        // Check VLANs
        const newVlanArray = newVlans.data.VlanNewCfgTable;
        const curVlanArray = curVlans.data.VlanCurCfgTable;
        
        if (newVlanArray.length !== curVlanArray.length) {
          hasChanges = true;
          changes.push(`VLANs: Count changed (${curVlanArray.length} → ${newVlanArray.length})`);
        }
        
        // Display results
        if (hasChanges) {
          formattedOutput += `⚠️  Configuration Status: PENDING CHANGES\n\n`;
          formattedOutput += `📋 Detected Changes (${changes.length}):\n\n`;
          changes.forEach((change, idx) => {
            formattedOutput += `   ${idx + 1}. ${change}\n`;
          });
          formattedOutput += `\n`;
          formattedOutput += `⚡ Action Required:\n`;
          formattedOutput += `   • Apply changes: Use device management interface\n`;
          formattedOutput += `   • Save to flash: Persist changes across reboots\n`;
          formattedOutput += `   • Or revert: Discard pending changes\n`;
        } else {
          formattedOutput += `✅ Configuration Status: SYNCHRONIZED\n\n`;
          formattedOutput += `All configurations are in sync between:\n`;
          formattedOutput += `   • New (pending) configuration\n`;
          formattedOutput += `   • Current (active) configuration\n\n`;
          formattedOutput += `No pending changes detected.\n`;
        }
        
        formattedOutput += `\n${'='.repeat(70)}\n`;
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "validate_server_config": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const client = createAlteonClient(connection);
        
        const [servers, extServers] = await Promise.all([
          client.get('/config/SlbNewCfgEnhRealServerTable'),
          client.get('/config/SlbNewCfgEnhRealServerSecondPartTable').catch(() => ({ data: { SlbNewCfgEnhRealServerSecondPartTable: [] } }))
        ]);
        
        const serverArray = servers.data.SlbNewCfgEnhRealServerTable;
        const targetIndex = args.server_index as string | undefined;
        const serversToValidate = targetIndex 
          ? serverArray.filter((s: any) => s.Index.toString() === targetIndex)
          : serverArray;
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `✅ REAL SERVER CONFIGURATION VALIDATION\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const issues: string[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];
        
        // Check for duplicate IPs
        const ipCounts = new Map<string, number>();
        serverArray.forEach((srv: any) => {
          ipCounts.set(srv.IpAddr, (ipCounts.get(srv.IpAddr) || 0) + 1);
        });
        ipCounts.forEach((count, ip) => {
          if (count > 1) {
            issues.push(`Duplicate IP address: ${ip} used by ${count} servers`);
          }
        });
        
        // Validate each server
        serversToValidate.forEach((srv: any) => {
          const serverLabel = `Server ${srv.Index} (${srv.IpAddr})`;
          
          // Check health check timeout
          if (srv.TimeOut < 2) {
            warnings.push(`${serverLabel}: Health check timeout too low (${srv.TimeOut}s)`);
            recommendations.push(`${serverLabel}: Increase timeout to at least 2-3 seconds`);
          }
          
          // Check weight
          if (srv.Weight < 1) {
            issues.push(`${serverLabel}: Invalid weight ${srv.Weight} (must be >= 1)`);
          } else if (srv.Weight > 100) {
            warnings.push(`${serverLabel}: Unusually high weight ${srv.Weight}`);
          }
          
          // Check max connections
          if (srv.MaxConns === 0) {
            recommendations.push(`${serverLabel}: Unlimited connections - consider setting a limit`);
          } else if (srv.MaxConns < 10) {
            warnings.push(`${serverLabel}: Very low max connections (${srv.MaxConns})`);
          }
          
          // Check state
          if (srv.State !== 2) {
            warnings.push(`${serverLabel}: Server is disabled (State=${srv.State})`);
          }
          
          // Check ping interval
          if (srv.PingInterval > 0 && srv.PingInterval < srv.TimeOut) {
            issues.push(`${serverLabel}: Ping interval (${srv.PingInterval}s) < timeout (${srv.TimeOut}s)`);
          }
        });
        
        // Display results
        formattedOutput += `Validated ${serversToValidate.length} server(s)\n\n`;
        
        if (issues.length > 0) {
          formattedOutput += `🚨 Critical Issues (${issues.length}):\n`;
          issues.forEach((issue, idx) => {
            formattedOutput += `   ${idx + 1}. ${issue}\n`;
          });
          formattedOutput += `\n`;
        }
        
        if (warnings.length > 0) {
          formattedOutput += `⚠️  Warnings (${warnings.length}):\n`;
          warnings.forEach((warning, idx) => {
            formattedOutput += `   ${idx + 1}. ${warning}\n`;
          });
          formattedOutput += `\n`;
        }
        
        if (recommendations.length > 0) {
          formattedOutput += `💡 Recommendations (${recommendations.length}):\n`;
          recommendations.forEach((rec, idx) => {
            formattedOutput += `   ${idx + 1}. ${rec}\n`;
          });
          formattedOutput += `\n`;
        }
        
        if (issues.length === 0 && warnings.length === 0) {
          formattedOutput += `✅ No critical issues or warnings found!\n`;
          formattedOutput += `Server configuration meets best practices.\n\n`;
        }
        
        // Overall assessment
        formattedOutput += `${'='.repeat(70)}\n`;
        formattedOutput += `Overall Status: `;
        if (issues.length > 0) {
          formattedOutput += `❌ ACTION REQUIRED (${issues.length} critical issues)\n`;
        } else if (warnings.length > 0) {
          formattedOutput += `⚠️  REVIEW RECOMMENDED (${warnings.length} warnings)\n`;
        } else {
          formattedOutput += `✅ HEALTHY\n`;
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "validate_service_group": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const client = createAlteonClient(connection);
        
        const [groups, members, servers, extServers] = await Promise.all([
          client.get('/config/SlbNewCfgEnhGroupTable'),
          client.get('/config/SlbNewCfgEnhGroupRealServerTable'),
          client.get('/config/SlbNewCfgEnhRealServerTable'),
          client.get('/config/SlbNewCfgEnhRealServerSecondPartTable').catch(() => ({ data: { SlbNewCfgEnhRealServerSecondPartTable: [] } }))
        ]);
        
        const groupArray = groups.data.SlbNewCfgEnhGroupTable;
        const memberArray = members.data.SlbNewCfgEnhGroupRealServerTable;
        const serverArray = servers.data.SlbNewCfgEnhRealServerTable;
        const extServerArray = extServers.data.SlbNewCfgEnhRealServerSecondPartTable || [];
        
        const targetGroup = args.group_index as string | undefined;
        const groupsToValidate = targetGroup
          ? groupArray.filter((g: any) => g.Index === targetGroup)
          : groupArray;
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `✅ SERVICE GROUP CONFIGURATION VALIDATION\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const issues: string[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];
        
        groupsToValidate.forEach((group: any) => {
          const groupLabel = `Group ${group.Index}`;
          const groupMembers = memberArray.filter((m: any) => m.RealServGroupIndex === group.Index);
          
          // Check for empty groups
          if (groupMembers.length === 0) {
            warnings.push(`${groupLabel}: No members configured (empty group)`);
          } else {
            // Check member availability
            let enabledCount = 0;
            let availableCount = 0;
            
            groupMembers.forEach((member: any) => {
              if (member.State === 2) enabledCount++;
              
              const extSrv = extServerArray.find((e: any) => e.Index === member.ServIndex);
              if (extSrv && extSrv.Avail === '1') availableCount++;
            });
            
            if (enabledCount === 0) {
              issues.push(`${groupLabel}: All members are disabled`);
            } else if (enabledCount === 1) {
              warnings.push(`${groupLabel}: Only 1 enabled member (no redundancy)`);
            }
            
            if (availableCount === 0 && enabledCount > 0) {
              issues.push(`${groupLabel}: All enabled members are unavailable/failed`);
            }
            
            // Check weight distribution
            const weights = groupMembers.map((m: any) => {
              const srv = serverArray.find((s: any) => s.Index === m.ServIndex);
              return srv ? srv.Weight : 1;
            });
            
            const allSameWeight = weights.every((w: number) => w === weights[0]);
            if (!allSameWeight && group.Metric === 2) {
              recommendations.push(`${groupLabel}: Using Least Connections with uneven weights - verify intentional`);
            }
            
            // Check health check configuration
            if (!group.HealthID || group.HealthID === '') {
              warnings.push(`${groupLabel}: No health check configured`);
            }
          }
        });
        
        // Display results
        formattedOutput += `Validated ${groupsToValidate.length} service group(s)\n\n`;
        
        if (issues.length > 0) {
          formattedOutput += `🚨 Critical Issues (${issues.length}):\n`;
          issues.forEach((issue, idx) => {
            formattedOutput += `   ${idx + 1}. ${issue}\n`;
          });
          formattedOutput += `\n`;
        }
        
        if (warnings.length > 0) {
          formattedOutput += `⚠️  Warnings (${warnings.length}):\n`;
          warnings.forEach((warning, idx) => {
            formattedOutput += `   ${idx + 1}. ${warning}\n`;
          });
          formattedOutput += `\n`;
        }
        
        if (recommendations.length > 0) {
          formattedOutput += `💡 Recommendations (${recommendations.length}):\n`;
          recommendations.forEach((rec, idx) => {
            formattedOutput += `   ${idx + 1}. ${rec}\n`;
          });
          formattedOutput += `\n`;
        }
        
        if (issues.length === 0 && warnings.length === 0) {
          formattedOutput += `✅ No critical issues or warnings found!\n`;
          formattedOutput += `Service group configuration is healthy.\n\n`;
        }
        
        // Overall assessment
        formattedOutput += `${'='.repeat(70)}\n`;
        formattedOutput += `Overall Status: `;
        if (issues.length > 0) {
          formattedOutput += `❌ ACTION REQUIRED (${issues.length} critical issues)\n`;
        } else if (warnings.length > 0) {
          formattedOutput += `⚠️  REVIEW RECOMMENDED (${warnings.length} warnings)\n`;
        } else {
          formattedOutput += `✅ HEALTHY\n`;
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "generate_config_report": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const client = createAlteonClient(connection);
        
        // Gather comprehensive configuration data
        const [sysInfo, vlans, interfaces, servers, groups, members, virtServers] = await Promise.all([
          client.get('/config?prop=agSysName,agSysLocation,agSysContact,agSysRunningVer'),
          client.get('/config/VlanNewCfgTable'),
          client.get('/config/IpNewCfgIntfTable'),
          client.get('/config/SlbNewCfgEnhRealServerTable'),
          client.get('/config/SlbNewCfgEnhGroupTable'),
          client.get('/config/SlbNewCfgEnhGroupRealServerTable'),
          client.get('/config/SlbNewCfgEnhVirtServerTable').catch(() => ({ data: { SlbNewCfgEnhVirtServerTable: [] } }))
        ]);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `📊 CONFIGURATION AUDIT REPORT\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        // System Info
        formattedOutput += `🖥️  Device Information:\n`;
        formattedOutput += `   Name: ${sysInfo.data.agSysName || 'N/A'}\n`;
        formattedOutput += `   Location: ${sysInfo.data.agSysLocation || 'N/A'}\n`;
        formattedOutput += `   Version: ${sysInfo.data.agSysRunningVer || 'N/A'}\n`;
        formattedOutput += `   Report Generated: ${new Date().toISOString()}\n\n`;
        
        // Resource Summary
        formattedOutput += `${'='.repeat(70)}\n`;
        formattedOutput += `📦 Resource Utilization:\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const vlanCount = vlans.data.VlanNewCfgTable.length;
        const interfaceCount = interfaces.data.IpNewCfgIntfTable.length;
        const serverCount = servers.data.SlbNewCfgEnhRealServerTable.length;
        const groupCount = groups.data.SlbNewCfgEnhGroupTable.length;
        const virtServerCount = Array.isArray(virtServers.data.SlbNewCfgEnhVirtServerTable) 
          ? virtServers.data.SlbNewCfgEnhVirtServerTable.length : 0;
        
        formattedOutput += `   VLANs Configured: ${vlanCount}\n`;
        formattedOutput += `   IP Interfaces: ${interfaceCount}\n`;
        formattedOutput += `   Real Servers: ${serverCount}\n`;
        formattedOutput += `   Service Groups: ${groupCount}\n`;
        formattedOutput += `   Virtual Servers: ${virtServerCount}\n\n`;
        
        // Health Summary
        formattedOutput += `${'='.repeat(70)}\n`;
        formattedOutput += `🏥 Configuration Health:\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const enabledServers = servers.data.SlbNewCfgEnhRealServerTable.filter((s: any) => s.State === 2).length;
        const emptyGroups = groups.data.SlbNewCfgEnhGroupTable.filter((g: any) => {
          return members.data.SlbNewCfgEnhGroupRealServerTable.filter((m: any) => m.RealServGroupIndex === g.Index).length === 0;
        }).length;
        
        formattedOutput += `   Real Servers:\n`;
        formattedOutput += `      Total: ${serverCount}\n`;
        formattedOutput += `      Enabled: ${enabledServers}\n`;
        formattedOutput += `      Disabled: ${serverCount - enabledServers}\n\n`;
        
        formattedOutput += `   Service Groups:\n`;
        formattedOutput += `      Total: ${groupCount}\n`;
        formattedOutput += `      With Members: ${groupCount - emptyGroups}\n`;
        formattedOutput += `      Empty: ${emptyGroups}\n\n`;
        
        // Recommendations
        formattedOutput += `${'='.repeat(70)}\n`;
        formattedOutput += `💡 Recommendations:\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const recList: string[] = [];
        
        if (emptyGroups > 0) {
          recList.push(`${emptyGroups} empty service group(s) - consider removing or adding members`);
        }
        if (serverCount - enabledServers > serverCount * 0.3) {
          recList.push(`>30% of servers disabled - review if intentional`);
        }
        if (virtServerCount === 0 && serverCount > 0) {
          recList.push(`Real servers configured but no virtual servers - incomplete setup?`);
        }
        if (interfaceCount < vlanCount * 0.5) {
          recList.push(`Many VLANs without L3 interfaces - review network design`);
        }
        if (serverCount > 0 && groupCount === 0) {
          recList.push(`Real servers exist but no service groups configured`);
        }
        
        if (recList.length > 0) {
          recList.forEach((rec, idx) => {
            formattedOutput += `   ${idx + 1}. ${rec}\n`;
          });
        } else {
          formattedOutput += `   ✅ Configuration appears well-structured\n`;
        }
        
        formattedOutput += `\n${'='.repeat(70)}\n`;
        formattedOutput += `Overall Assessment: `;
        
        if (recList.length === 0 && emptyGroups === 0) {
          formattedOutput += `✅ HEALTHY - No significant issues detected\n`;
        } else if (recList.length <= 2) {
          formattedOutput += `⚠️  REVIEW RECOMMENDED - Minor improvements possible\n`;
        } else {
          formattedOutput += `🔍 ATTENTION NEEDED - Several areas for improvement\n`;
        }
        
        formattedOutput += `\nReport Complete. Use specific validation tools for detailed analysis.\n`;
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_virtual_service_details": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const vsIndex = args.vs_index as string;
        const client = createAlteonClient(connection);
        
        const response = await client.get(`/config/SlbNewCfgEnhVirtServicesTable/${vsIndex}`);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `🔌 VIRTUAL SERVICES FOR VS ${vsIndex}\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const services = Array.isArray(response.data.SlbNewCfgEnhVirtServicesTable) 
          ? response.data.SlbNewCfgEnhVirtServicesTable 
          : [response.data.SlbNewCfgEnhVirtServicesTable];
        
        if (services.length === 0) {
          formattedOutput += `No services configured on this virtual server.\n`;
        } else {
          services.forEach((svc: any) => {
            formattedOutput += `Service ${svc.ServIndex}:\n`;
            formattedOutput += `   Port: ${svc.VirtPort}\n`;
            formattedOutput += `   Protocol: ${svc.RealPort === 0 ? 'HTTP' : 'TCP/UDP'}\n`;
            formattedOutput += `   Service Group: ${svc.RealGroup || 'None'}\n`;
            formattedOutput += `   Session Timeout: ${svc.TimeOut || 'Default'}s\n`;
            formattedOutput += `   Cookie Mode: ${svc.CookieMode === 1 ? 'Disabled' : svc.CookieMode === 2 ? 'Enabled' : 'Passive'}\n`;
            formattedOutput += `   Direct Access Mode: ${svc.DirServerRtn === 1 ? 'Disabled' : 'Enabled'}\n`;
            formattedOutput += `\n`;
          });
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_virtual_server_runtime_stats": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const vsIndex = args.vs_index as string | undefined;
        const client = createAlteonClient(connection);
        
        const endpoint = vsIndex 
          ? `/oper/SlbVirtServerTable/${vsIndex}`
          : `/oper/SlbVirtServerTable`;
        
        const response = await client.get(endpoint);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `📊 VIRTUAL SERVER RUNTIME STATISTICS\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const stats = Array.isArray(response.data.SlbVirtServerTable) 
          ? response.data.SlbVirtServerTable 
          : [response.data.SlbVirtServerTable];
        
        if (stats.length === 0) {
          formattedOutput += `No runtime statistics available.\n`;
        } else {
          stats.forEach((vs: any) => {
            formattedOutput += `Virtual Server ${vs.Index || 'N/A'}:\n`;
            formattedOutput += `   Current Connections: ${vs.CurrSessions || 0}\n`;
            formattedOutput += `   Total Connections: ${vs.TotalSessions || 0}\n`;
            formattedOutput += `   Bytes In: ${vs.HCOctetsIn || 0}\n`;
            formattedOutput += `   Bytes Out: ${vs.HCOctetsOut || 0}\n`;
            formattedOutput += `   Packets In: ${vs.HCFramesIn || 0}\n`;
            formattedOutput += `   Packets Out: ${vs.HCFramesOut || 0}\n`;
            formattedOutput += `   Operational State: ${vs.State === 2 ? '🟢 Up' : vs.State === 3 ? '🔴 Down' : '⚪ Unknown'}\n`;
            formattedOutput += `\n`;
          });
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_virtual_service_runtime_stats": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const vsIndex = args.vs_index as string;
        const serviceIndex = args.service_index as string | undefined;
        const client = createAlteonClient(connection);
        
        const endpoint = serviceIndex
          ? `/oper/SlbVirtServicesTable/${vsIndex}/${serviceIndex}`
          : `/oper/SlbVirtServicesTable/${vsIndex}`;
        
        const response = await client.get(endpoint);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `📊 VIRTUAL SERVICE RUNTIME STATISTICS\n`;
        formattedOutput += `   VS ${vsIndex}${serviceIndex ? ` / Service ${serviceIndex}` : ''}\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const stats = Array.isArray(response.data.SlbVirtServicesTable) 
          ? response.data.SlbVirtServicesTable 
          : [response.data.SlbVirtServicesTable];
        
        if (stats.length === 0) {
          formattedOutput += `No runtime statistics available.\n`;
        } else {
          stats.forEach((svc: any) => {
            formattedOutput += `Service ${svc.ServIndex || 'N/A'} (Port ${svc.VirtPort || 'N/A'}):\n`;
            formattedOutput += `   Current Connections: ${svc.CurrSessions || 0}\n`;
            formattedOutput += `   Total Connections: ${svc.TotalSessions || 0}\n`;
            formattedOutput += `   Failed Connections: ${svc.FailedSessions || 0}\n`;
            formattedOutput += `   Bytes In: ${svc.HCOctetsIn || 0}\n`;
            formattedOutput += `   Bytes Out: ${svc.HCOctetsOut || 0}\n`;
            formattedOutput += `   Availability: ${svc.Available === 1 ? '🟢 Available' : '🔴 Unavailable'}\n`;
            formattedOutput += `\n`;
          });
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_real_server_operational_stats": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const serverIndex = args.server_index as string | undefined;
        const client = createAlteonClient(connection);
        
        const endpoint = serverIndex
          ? `/oper/SlbRealServerTable/${serverIndex}`
          : `/oper/SlbRealServerTable`;
        
        const response = await client.get(endpoint);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `📊 REAL SERVER OPERATIONAL STATISTICS\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const stats = Array.isArray(response.data.SlbRealServerTable) 
          ? response.data.SlbRealServerTable 
          : [response.data.SlbRealServerTable];
        
        if (stats.length === 0) {
          formattedOutput += `No operational statistics available.\n`;
        } else {
          stats.forEach((srv: any) => {
            formattedOutput += `Real Server ${srv.Index || 'N/A'} (${srv.IpAddr || 'N/A'}):\n`;
            formattedOutput += `   Current Connections: ${srv.CurrSessions || 0}\n`;
            formattedOutput += `   Total Connections: ${srv.TotalSessions || 0}\n`;
            formattedOutput += `   Failed Connections: ${srv.FailedSessions || 0}\n`;
            formattedOutput += `   Bytes In: ${srv.HCOctetsIn || 0}\n`;
            formattedOutput += `   Bytes Out: ${srv.HCOctetsOut || 0}\n`;
            formattedOutput += `   Packets In: ${srv.HCFramesIn || 0}\n`;
            formattedOutput += `   Packets Out: ${srv.HCFramesOut || 0}\n`;
            formattedOutput += `   Health Status: ${srv.Health === 1 ? '🟢 Healthy' : srv.Health === 2 ? '🔴 Failed' : '⚪ Unknown'}\n`;
            formattedOutput += `\n`;
          });
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_real_server_operational_info": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const serverIndex = args.server_index as string | undefined;
        const client = createAlteonClient(connection);
        
        const endpoint = serverIndex
          ? `/oper/SlbRealServerInfoTable/${serverIndex}`
          : `/oper/SlbRealServerInfoTable`;
        
        const response = await client.get(endpoint);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `ℹ️  REAL SERVER OPERATIONAL INFO\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const info = Array.isArray(response.data.SlbRealServerInfoTable) 
          ? response.data.SlbRealServerInfoTable 
          : [response.data.SlbRealServerInfoTable];
        
        if (info.length === 0) {
          formattedOutput += `No operational information available.\n`;
        } else {
          info.forEach((srv: any) => {
            formattedOutput += `Real Server ${srv.Index || 'N/A'} (${srv.IpAddr || 'N/A'}):\n`;
            formattedOutput += `   Operational State: ${srv.State === 1 ? '🔴 Down' : srv.State === 2 ? '🟢 Up' : srv.State === 3 ? '🟡 Warning' : srv.State === 4 ? '⚪ Shutdown' : 'Unknown'}\n`;
            formattedOutput += `   Current Weight: ${srv.Weight || 'N/A'}\n`;
            formattedOutput += `   Health Check Result: ${srv.HealthCheckResult === 1 ? '✅ Passed' : srv.HealthCheckResult === 2 ? '❌ Failed' : 'Unknown'}\n`;
            formattedOutput += `   Last Failure Reason: ${srv.FailureReason || 'None'}\n`;
            formattedOutput += `   Response Time: ${srv.ResponseTime || 0}ms\n`;
            formattedOutput += `\n`;
          });
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_service_group_runtime_stats": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const groupIndex = args.group_index as string | undefined;
        const client = createAlteonClient(connection);
        
        const endpoint = groupIndex
          ? `/oper/SlbGroupTable/${groupIndex}`
          : `/oper/SlbGroupTable`;
        
        const response = await client.get(endpoint);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `📊 SERVICE GROUP RUNTIME STATISTICS\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const stats = Array.isArray(response.data.SlbGroupTable) 
          ? response.data.SlbGroupTable 
          : [response.data.SlbGroupTable];
        
        if (stats.length === 0) {
          formattedOutput += `No runtime statistics available.\n`;
        } else {
          stats.forEach((grp: any) => {
            formattedOutput += `Service Group ${grp.Index || 'N/A'} (${grp.Name || 'N/A'}):\n`;
            formattedOutput += `   Current Connections: ${grp.CurrSessions || 0}\n`;
            formattedOutput += `   Total Connections: ${grp.TotalSessions || 0}\n`;
            formattedOutput += `   Bytes In: ${grp.HCOctetsIn || 0}\n`;
            formattedOutput += `   Bytes Out: ${grp.HCOctetsOut || 0}\n`;
            formattedOutput += `   Packets In: ${grp.HCFramesIn || 0}\n`;
            formattedOutput += `   Packets Out: ${grp.HCFramesOut || 0}\n`;
            formattedOutput += `   Active Servers: ${grp.ActiveServers || 0}\n`;
            formattedOutput += `   Health Status: ${grp.Health === 1 ? '🟢 Healthy' : grp.Health === 2 ? '🔴 Failed' : '⚪ Unknown'}\n`;
            formattedOutput += `\n`;
          });
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_health_check_config": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const healthCheckId = args.health_check_id as string | undefined;
        const client = createAlteonClient(connection);
        
        const endpoint = healthCheckId
          ? `/config/SlbNewCfgEnhHealthCheckTable/${healthCheckId}`
          : `/config/SlbNewCfgEnhHealthCheckTable`;
        
        const response = await client.get(endpoint);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `🏥 HEALTH CHECK CONFIGURATION\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const checks = Array.isArray(response.data.SlbNewCfgEnhHealthCheckTable) 
          ? response.data.SlbNewCfgEnhHealthCheckTable 
          : [response.data.SlbNewCfgEnhHealthCheckTable];
        
        if (checks.length === 0) {
          formattedOutput += `No health checks configured.\n`;
        } else {
          checks.forEach((hc: any) => {
            const typeMap: Record<number, string> = {
              1: 'ICMP (Ping)',
              2: 'TCP',
              3: 'HTTP',
              4: 'HTTPS',
              5: 'DNS',
              6: 'SMTP',
              7: 'POP3',
              8: 'IMAP',
              9: 'FTP',
              10: 'LDAP',
              11: 'RADIUS',
              12: 'SIP',
              13: 'WTS',
              14: 'RTSP',
              15: 'Script'
            };
            
            formattedOutput += `Health Check ${hc.ID || 'N/A'} (${hc.Name || 'Unnamed'}):\n`;
            formattedOutput += `   Type: ${typeMap[hc.DType] || `Unknown (${hc.DType})`}\n`;
            formattedOutput += `   Interval: ${hc.Interval || 'N/A'}s\n`;
            formattedOutput += `   Timeout: ${hc.Timeout || 'N/A'}s\n`;
            formattedOutput += `   Retry Count: ${hc.Retries || 'N/A'}\n`;
            formattedOutput += `   Success Threshold: ${hc.RestoreRetries || 'N/A'}\n`;
            formattedOutput += `   Failure Threshold: ${hc.DownRetries || 'N/A'}\n`;
            
            if (hc.DType === 3 || hc.DType === 4) { // HTTP/HTTPS
              formattedOutput += `   HTTP Method: ${hc.Method === 1 ? 'GET' : hc.Method === 2 ? 'POST' : hc.Method === 3 ? 'HEAD' : 'Unknown'}\n`;
              formattedOutput += `   HTTP Path: ${hc.Path || '/'}\n`;
              formattedOutput += `   Expected Status: ${hc.ResponseCode || '200'}\n`;
            }
            
            formattedOutput += `\n`;
          });
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      case "get_health_check_results": {
        const connection: AlteonConnection = {
          ip: args.ip as string,
          username: args.username as string,
          password: args.password as string,
        };
        const serverId = args.server_id as string | undefined;
        const client = createAlteonClient(connection);
        
        const endpoint = serverId
          ? `/oper/SlbHealthCheckTable/${serverId}`
          : `/oper/SlbHealthCheckTable`;
        
        const response = await client.get(endpoint);
        
        let formattedOutput = `${'='.repeat(70)}\n`;
        formattedOutput += `🏥 HEALTH CHECK RESULTS\n`;
        formattedOutput += `${'='.repeat(70)}\n\n`;
        
        const results = Array.isArray(response.data.SlbHealthCheckTable) 
          ? response.data.SlbHealthCheckTable 
          : [response.data.SlbHealthCheckTable];
        
        if (results.length === 0) {
          formattedOutput += `No health check results available.\n`;
        } else {
          results.forEach((result: any) => {
            formattedOutput += `Server ${result.ServerIndex || 'N/A'} - Health Check ${result.HealthCheckID || 'N/A'}:\n`;
            formattedOutput += `   Status: ${result.Status === 1 ? '✅ Passed' : result.Status === 2 ? '❌ Failed' : result.Status === 3 ? '⏳ In Progress' : '⚪ Unknown'}\n`;
            formattedOutput += `   Last Check Time: ${result.LastCheckTime || 'N/A'}\n`;
            formattedOutput += `   Response Time: ${result.ResponseTime || 0}ms\n`;
            formattedOutput += `   Failure Count: ${result.FailureCount || 0}\n`;
            formattedOutput += `   Success Count: ${result.SuccessCount || 0}\n`;
            
            if (result.Status === 2 && result.FailureReason) {
              formattedOutput += `   Failure Reason: ${result.FailureReason}\n`;
            }
            
            formattedOutput += `\n`;
          });
        }
        
        return {
          content: [{ type: "text", text: formattedOutput }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data || error.message;
      throw new Error(`Alteon API Error: ${errorMessage}`);
    }
    throw error;
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Alteon MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
