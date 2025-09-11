#!/usr/bin/env node

/**
 * Alteon MCP Server
 * 
 * A Model Context Protocol server for interacting with Alteon Application Delivery Controllers.
 * Provides AI assistants with tools to query and manage Alteon devices via REST API.
 * 
 * @author SeanR <seanramati95@gmail.com>
 * @version 1.2.0
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

// Interface for Alteon connection parameters
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
    version: "1.2.0",
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
                '1': '🟢 Enabled',
                '2': '🔴 Disabled',
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
