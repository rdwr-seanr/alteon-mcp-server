#!/usr/bin/env node

/**
 * Alteon MCP Server
 * 
 * A Model Context Protocol server for interacting with Alteon Application Delivery Controllers.
 * Provides AI assistants with tools to query and manage Alteon devices via REST API.
 * 
 * @author SeanR <seanramati95@gmail.com>
 * @version 1.0.0
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
    version: "1.0.0",
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
