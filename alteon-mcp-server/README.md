# Alteon MCP Server

A simple Model Context Protocol (MCP) server for interacting with Alteon devices via REST API.

## What is MCP?

Model Context Protocol (MCP) is a standard protocol that allows AI assistants to securely connect to external systems and data sources. This MCP server enables AI assistants to interact with Alteon load balancers through their REST API.

## Features

This MCP server provides the following tools:

1. **get_system_info** - Retrieve basic system information (hostname, version, uptime)
2. **get_vlan_table** - Get VLAN configuration table
3. **get_dns_config** - Retrieve DNS client configuration
4. **get_interface_stats** - Get interface configuration and statistics

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Usage with LM Studio

To use this MCP server with LM Studio, you need to configure it in your LM Studio MCP settings.

### Step 1: Build the MCP server
```bash
cd alteon-mcp-server
npm install
npm run build
```

### Step 2: Configure LM Studio
In LM Studio, add this MCP server configuration:
```json
{
  "mcpServers": {
    "alteon": {
      "command": "node",
      "args": ["C:\\Users\\SeanR\\Documents\\small-alteon-mcp\\alteon-mcp-server\\dist\\index.js"],
      "env": {}
    }
  }
}
```

### Step 3: Test with your Alteon device
Once configured, you can ask the AI assistant questions like:

- "Get system information from my Alteon at 10.210.240.23 with username admin and password admin"
- "Show me the VLAN configuration from my Alteon"
- "What's the DNS configuration on my Alteon device?"

## Example Usage

The AI assistant will use the MCP tools automatically when you ask questions about your Alteon device. For example:

```
User: "Can you check the system info for my Alteon at 10.210.240.23? Username is admin, password is admin"

AI Assistant: I'll check the system information for your Alteon device.
[Uses get_system_info tool with the provided credentials]

The system information shows:
- System Name: [device hostname]
- Location: [configured location]
- Software Version: [current version]
- Boot Version: [boot version]
```

## API Structure

This MCP server uses the Alteon REST API structure:
- Base URL: `https://<IP>/config/`
- Authentication: Basic Auth (username/password)
- Format: JSON responses
- SSL: Disabled for lab environments (can be enabled for production)

## Security Note

This example disables SSL certificate verification for lab/demo environments. For production use, ensure proper SSL certificates are configured on your Alteon devices.

## Troubleshooting

1. **Connection Issues**: Ensure the Alteon IP is reachable and the REST API is enabled
2. **Authentication Errors**: Verify username/password credentials
3. **SSL Errors**: The server disables SSL verification for lab environments
4. **Timeout Issues**: Default timeout is 10 seconds, increase if needed

## Learning MCP

This simple implementation demonstrates:
- How to create MCP tools
- How to handle tool parameters
- How to make external API calls
- How to return formatted responses to the AI assistant
- Basic error handling and logging

The code is intentionally simple and well-commented to help you understand how MCP works!
