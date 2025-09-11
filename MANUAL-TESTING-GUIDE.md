# LM Studio Setup Guide for Alteon MCP Server

## 🎯 Quick Setup for Manual Testing

### Method 1: Start MCP Server Manually (Easiest for Testing)

1. **Start the MCP Server:**
   ```bash
   # Open PowerShell in the project directory
   cd "C:\Users\SeanR\Documents\small-alteon-mcp"
   .\start-mcp-server.bat
   ```
   
   Or run directly:
   ```bash
   cd "C:\Users\SeanR\Documents\small-alteon-mcp\alteon-mcp-server"
   node dist/index.js
   ```

2. **The server will start and show:**
   ```
   Alteon MCP Server running on stdio
   Available tools:
   - get_system_info
   - get_vlan_table
   - get_dns_config
   - get_interface_stats
   - get_port_traffic_stats
   ```

3. **Keep this window open** - the server needs to stay running while you test

4. **Test manually by typing JSON-RPC commands:**
   ```json
   {"jsonrpc":"2.0","id":1,"method":"tools/list"}
   ```

### Method 2: LM Studio Integration (For Real Usage)

1. **Find LM Studio's MCP configuration:**
   - Location: `%APPDATA%\LMStudio\mcp_config.json`
   - Or look for settings in LM Studio → Settings → MCP

2. **Add this configuration:**
   ```json
   {
     "mcpServers": {
       "alteon": {
         "command": "node",
         "args": [
           "C:\\Users\\SeanR\\Documents\\small-alteon-mcp\\alteon-mcp-server\\dist\\index.js"
         ],
         "env": {}
       }
     }
   }
   ```

3. **Restart LM Studio completely**

4. **Test in LM Studio chat:**
   ```
   "Can you get the system information from my Alteon device at 10.210.240.23? 
   Username is admin, password is admin"
   ```

## 🧪 Manual Testing Commands

### Test Tool Listing
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

### Test System Info
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_system_info",
    "arguments": {
      "ip": "10.210.240.23",
      "username": "admin",
      "password": "admin"
    }
  }
}
```

### Test Traffic Statistics (NEW!)
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_port_traffic_stats",
    "arguments": {
      "ip": "10.210.240.23",
      "username": "admin",
      "password": "admin"
    }
  }
}
```

### Test Specific Port Traffic
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_port_traffic_stats",
    "arguments": {
      "ip": "10.210.240.23",
      "username": "admin",
      "password": "admin",
      "port": 2
    }
  }
}
```

## 🎯 Natural Language Test Queries for LM Studio

Once integrated with LM Studio, try these natural language queries:

### Basic Monitoring
- "What's the status of my Alteon device at 10.210.240.23?"
- "Show me the VLAN configuration on my load balancer"
- "What DNS settings are configured on the Alteon?"

### Traffic Analytics (NEW!)
- "How much traffic is going through port 2 on my Alteon?"
- "Are there any errors on my load balancer ports?"
- "Which port has the highest traffic utilization?"
- "Show me detailed traffic statistics for all ports"

### Troubleshooting
- "Are there any packet errors on my Alteon interfaces?"
- "What's the health status of port 1?"
- "Show me interface utilization on my load balancer"

## 🔧 Troubleshooting

### MCP Server Won't Start
```bash
# Check if TypeScript is compiled
cd alteon-mcp-server
npm run build

# Check for errors
node dist/index.js
```

### LM Studio Can't Find MCP Server
1. Verify the file path in configuration is correct
2. Make sure Node.js is in your system PATH
3. Restart LM Studio completely after config changes
4. Check LM Studio logs for MCP connection errors

### Connection Errors to Alteon
1. Verify Alteon IP is reachable: `ping 10.210.240.23`
2. Check if REST API is enabled on Alteon
3. Verify username/password credentials
4. Ensure firewall allows connections to Alteon

### JSON-RPC Errors
- Always use double quotes in JSON
- Include required fields: jsonrpc, id, method
- Check parameter names match exactly

## 💡 Tips for Testing

1. **Start Simple**: Test `get_system_info` first
2. **Use Specific Queries**: Be specific about which Alteon device and credentials
3. **Monitor Server Output**: Watch the MCP server console for errors
4. **Try Different Tools**: Test all 5 available tools
5. **Natural Language**: In LM Studio, speak naturally - the AI will translate to tool calls

## 🎉 Success Indicators

You'll know it's working when:
- MCP server starts without errors
- LM Studio shows MCP connection in settings/logs
- Natural language queries get translated to tool calls
- You see real data from your Alteon device
- Traffic statistics show formatted, readable output

---

**Need Help?** Check the main README.md or run the test suite:
```bash
cd tests
node test-all-tools.mjs
```
