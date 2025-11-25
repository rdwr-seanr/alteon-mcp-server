# Alteon MCP Server

[![npm version](https://img.shields.io/npm/v/alteon-mcp-server.svg)](https://www.npmjs.com/package/alteon-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-v0.5.0-blue.svg)](https://modelcontextprotocol.io)

Professional Model Context Protocol (MCP) server for Radware Alteon Application Delivery Controllers. Enable AI assistants like Claude to monitor, analyze, and validate your Alteon infrastructure through natural language.

## What is This?

This MCP server allows AI assistants (Claude Desktop, ChatGPT, LM Studio) to interact with your Alteon ADC devices. Instead of navigating complex GUIs or remembering CLI commands, simply ask questions in plain English:

```
"Show me all real servers and their health status"
"Which service groups have issues?"
"Generate a configuration audit report"
"What's my current network topology?"
```

The AI assistant uses this server to fetch real-time data from your Alteon device and provide intelligent answers.

## Features

### 🎯 Comprehensive Monitoring & Validation

**Server & Load Balancing**
- Real server health status and runtime statistics
- Service group configuration and member status
- Virtual service monitoring
- Health check validation
- Load balancing configuration

**Network Infrastructure**
- VLAN configuration and details
- IP interface discovery
- Network topology mapping
- Gateway and routing configuration
- Port traffic statistics

**Configuration Management**
- Configuration synchronization checking
- Server configuration validation
- Service group validation
- Comprehensive audit reports
- Issue detection and recommendations

### 🚀 Key Capabilities

- ✅ **18 Professional Tools** - Complete coverage of monitoring, topology, and validation
- ✅ **Safe Operations** - All tools are read-only, no configuration changes
- ✅ **AI-Powered** - Natural language interface through Claude, ChatGPT, or other MCP clients
- ✅ **Production Ready** - Thoroughly tested with 100% pass rate
- ✅ **Enterprise Grade** - Professional code quality and comprehensive error handling

## Installation

### Quick Start with NPM

```bash
npm install -g alteon-mcp-server
```

### From Source

```bash
git clone https://github.com/rdwr-seanr/alteon-mcp-server.git
cd alteon-mcp-server/alteon-mcp-server
npm install
npm run build
```

### Prerequisites

- **Node.js** v18.0.0 or higher
- **Alteon Device** with REST API enabled
- **Network Access** HTTPS connectivity to your Alteon
- **Credentials** Admin username and password

## Configuration

### Claude Desktop (Recommended)

1. Locate your Claude Desktop config file:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the Alteon MCP server configuration:

```json
{
  "mcpServers": {
    "alteon": {
      "command": "node",
      "args": [
        "/path/to/alteon-mcp-server/dist/index.js"
      ],
      "env": {
        "ALTEON_HOST": "your-alteon-ip",
        "ALTEON_USERNAME": "admin",
        "ALTEON_PASSWORD": "your-password"
      }
    }
  }
}
```

3. Restart Claude Desktop

4. Start asking questions about your Alteon device!

### Alternative: LM Studio

Create a `lm-studio-config.json` file in the `alteon-mcp-server` directory:

```json
{
  "host": "your-alteon-ip",
  "username": "admin",
  "password": "your-password"
}
```

Then start LM Studio and enable MCP servers in settings.

### Environment Variables

You can also use environment variables:

```bash
# Linux/macOS
export ALTEON_HOST=10.210.240.96
export ALTEON_USERNAME=admin
export ALTEON_PASSWORD=your-password

# Windows PowerShell
$env:ALTEON_HOST="10.210.240.96"
$env:ALTEON_USERNAME="admin"
$env:ALTEON_PASSWORD="your-password"
```

## Usage Examples

Once configured, you can ask your AI assistant natural language questions:

### Server Monitoring
```
"Show me all real servers with their health status"
"Which servers are down or have issues?"
"What's the current load on my backend servers?"
```

**Example Response:**
```
Real Server Status:
✅ Server 1: 10.210.240.5 (Web-Server-1)
   Status: Enabled, State: Up
   Weight: 1, Connections: 245/10000

✅ Server 2: 10.210.240.6 (Web-Server-2)
   Status: Enabled, State: Up
   Weight: 1, Connections: 198/10000

✅ Server 3: 10.210.240.7 (DB-Server-1)
   Status: Enabled, State: Up
   Weight: 5, Connections: 52/10000
```

### Service Group Analysis
```
"Show me my service groups and their members"
"Are there any service groups with all members down?"
"Which service groups need attention?"
```

### Network Topology
```
"What's my current network topology?"
"Show me all VLANs and their configurations"
"List all IP interfaces and their VLAN assignments"
```

### Configuration Validation
```
"Generate a configuration audit report"
"Check if there are any pending configuration changes"
"Validate my server configurations for issues"
"Are there any service groups without members?"
```

**Example Response:**
```
Configuration Audit Report:

Resource Summary:
• VLANs: 6 configured
• IP Interfaces: 4 configured
• Real Servers: 3 active
• Service Groups: 4 configured
• Network Ports: 8 total

Health Overview:
✅ Healthy Servers: 3/3 (100%)
✅ Active Groups: 4/4 (100%)

Recommendations:
⚠️  Service group "Backup-Pool" has no members
💡 Consider adding health check timeouts for critical servers
```

## Available Tools

### Monitoring & Status (7 tools)
- `get_real_server_status` - Real server health and status
- `get_service_group_status` - Service group overview
- `get_virtual_service_status` - Virtual service status
- `get_system_health` - System health metrics
- `get_vlan_info` - VLAN configuration
- `get_traffic_stats` - Network traffic statistics
- `check_device_status` - Overall device health

### Server & Group Management (3 tools)
- `list_real_servers` - Detailed server listing
- `get_service_group_details` - Service group deep-dive
- `get_health_check_status` - Health check validation

### Network Topology (4 tools)
- `get_ip_interfaces` - IP interface configuration
- `get_vlan_details` - Detailed VLAN information
- `get_network_summary` - Complete topology view
- `get_gateway_config` - Gateway configuration

### Configuration Validation (4 tools)
- `check_config_sync` - Configuration sync status
- `validate_server_config` - Server validation
- `validate_service_group` - Service group validation
- `generate_config_report` - Comprehensive audit

## Testing

Verify your installation:

```bash
cd alteon-mcp-server
npm test
```

Expected output:
```
✅ Passed: 18/18 tests
📈 Success Rate: 100.0%
🎉 All tools working perfectly!
```

## Security Considerations

- **HTTPS Only**: All communication uses HTTPS
- **Credentials**: Store credentials securely in config files (never commit to git)
- **Read-Only**: All tools are read-only - no configuration changes possible
- **Network**: Ensure proper network segmentation for management access
- **Lab Environments**: Self-signed certificates are accepted (can be configured)

## Troubleshooting

### Connection Issues

```bash
# Test Alteon REST API connectivity
curl -k https://your-alteon-ip/config/SlbCurCfgEnhRealServerTable -u admin:password
```

### Common Issues

**"Connection refused" errors**
- Verify Alteon IP address is correct
- Ensure REST API is enabled on your Alteon
- Check network connectivity and firewall rules

**"Authentication failed" errors**
- Verify username and password
- Ensure account has admin privileges
- Check for special characters in password (may need escaping)

**"404 Not Found" errors**
- Some API endpoints may not be available on older Alteon firmware
- Verify your Alteon firmware version supports REST API
- Try updating to latest firmware if possible

**Empty or missing data**
- Some features require specific Alteon configuration
- Verify the resource exists (e.g., real servers, VLANs)
- Check Alteon logs for any API access issues

## Requirements

- **Node.js**: 18.0.0 or higher
- **Alteon ADC**: Firmware with REST API support (v32+)
- **Network**: HTTPS (port 443) connectivity
- **Credentials**: Admin-level access

## Architecture

```
alteon-mcp-server/
├── src/
│   └── index.ts          # Main MCP server (18 tools)
├── dist/                 # Compiled JavaScript
├── test-all-18-tools.mjs # Test suite
└── package.json          # NPM configuration
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-tool`)
3. Commit your changes (`git commit -m 'Add new monitoring tool'`)
4. Push to the branch (`git push origin feature/new-tool`)
5. Open a Pull Request

See [CONTRIBUTING.md](alteon-mcp-server/CONTRIBUTING.md) for detailed guidelines.

## Version History

See [CHANGELOG.md](alteon-mcp-server/CHANGELOG.md) for version history and release notes.

## License

MIT License - see [LICENSE](alteon-mcp-server/LICENSE) for details.

## Author

**Sean Ramati**
- Email: seanramati95@gmail.com
- GitHub: [@rdwr-seanr](https://github.com/rdwr-seanr)

## Acknowledgments

Built with:
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk) - MCP implementation
- [Radware Alteon ADC](https://www.radware.com/products/alteon/) - Target platform
- TypeScript, Node.js, and Axios

## Support

- 📖 [Documentation](https://github.com/rdwr-seanr/alteon-mcp-server#readme)
- 🐛 [Issue Tracker](https://github.com/rdwr-seanr/alteon-mcp-server/issues)
- 💬 [Discussions](https://github.com/rdwr-seanr/alteon-mcp-server/discussions)

---

**⚡ Built for AI-Powered Network Operations**
