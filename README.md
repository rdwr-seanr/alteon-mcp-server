# Alteon MCP Server

[![npm version](https://img.shields.io/npm/v/alteon-mcp-server.svg)](https://www.npmjs.com/package/alteon-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-v0.5.0-blue.svg)](https://modelcontextprotocol.io)

Professional Model Context Protocol (MCP) server for Radware Alteon Application Delivery Controllers. Provides comprehensive monitoring, topology discovery, configuration validation, and real-time operational statistics through AI-powered natural language interfaces.

**v1.7.0** - Production Ready with 24 Tools | 100% Test Pass Rate

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

### 🎯 Comprehensive Tool Suite (24 Tools)

**Phase 1: Core Monitoring (7 tools)**
- Real server status and health monitoring
- Service group status tracking
- Virtual service monitoring
- System health metrics
- VLAN information
- Network traffic statistics
- Overall device status

**Phase 2: Server & Group Management (3 tools)**
- Real server listing and details
- Service group configuration and members
- Health check status validation

**Phase 3: Network Topology (4 tools)**
- IP interface discovery
- VLAN configuration
- Network topology summary
- Gateway configuration

**Phase 4: Configuration Validation (4 tools)**
- Configuration synchronization checking
- Server configuration validation
- Service group validation
- Comprehensive configuration audit reports

**Phase 5: Runtime Statistics & Health Monitoring (6 tools)**
- Virtual service detailed configuration
- Virtual server runtime statistics
- Virtual service runtime statistics
- Real server operational statistics
- Real server operational info
- Service group runtime statistics

### 🚀 Key Capabilities

- ✅ **24 Production Tools** - Comprehensive monitoring, topology, validation, and runtime statistics
- ✅ **100% Test Pass Rate** - All tools verified and working on real hardware
- ✅ **Safe Operations** - Read-only tools, no configuration changes
- ✅ **AI-Powered** - Natural language interface through Claude, ChatGPT, or other MCP clients
- ✅ **Real-Time Stats** - Operational statistics and runtime monitoring
- ✅ **Enterprise Grade** - Professional code quality, TypeScript, comprehensive error handling

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

### Runtime Statistics (Phase 5)
```
"Show me real-time statistics for virtual server 1"
"What are the current connections on my real servers?"
"Get runtime statistics for service group Web-Pool"
"Show me operational info for all virtual services"
```

**Example Response:**
```
Virtual Server Runtime Statistics:

VS-1 (10.210.240.100):
   Current Connections: 1,245
   Total Sessions: 45,892
   Bytes In: 2.3 GB
   Bytes Out: 15.7 GB
   Status: Active
   Uptime: 15 days

Real Server Operational Stats:
   RS-1 (10.210.240.5): 421 connections, Healthy
   RS-2 (10.210.240.6): 398 connections, Healthy
   RS-3 (10.210.240.7): 426 connections, Healthy
```

## Available Tools (24 Total)

### Phase 1: Core Monitoring (7 tools)
- `get_system_info` - System information and version
- `get_dns_config` - DNS configuration
- `get_vlan_table` - VLAN table and configuration
- `get_ip_interfaces` - IP interface configuration
- `get_gateway_config` - Gateway configuration
- `get_network_summary` - Complete network topology
- `get_interface_stats` - Interface statistics

### Phase 2: Server & Group Management (3 tools)
- `get_port_traffic_stats` - Port traffic statistics
- `get_virtual_server_status` - Virtual server configuration
- `get_real_server_details` - Real server details and configuration

### Phase 3: Network Topology (4 tools)
- `get_real_server_runtime_stats` - Real server extended information
- `get_service_groups` - Service group configuration
- `get_service_group_details` - Service group members and details
- `get_network_topology` - Complete network topology view

### Phase 4: Configuration Validation (4 tools)
- `check_config_sync` - Configuration synchronization status
- `validate_server_config` - Real server configuration validation
- `validate_service_group` - Service group validation
- `generate_config_report` - Comprehensive audit report

### Phase 5: Runtime Statistics & Health Monitoring (6 tools)
- `get_virtual_service_details` - Virtual service detailed configuration
- `get_virtual_server_runtime_stats` - Real-time virtual server statistics
- `get_virtual_service_runtime_stats` - Per-service runtime statistics
- `get_real_server_operational_stats` - Real-time real server statistics
- `get_real_server_operational_info` - Real server operational info
- `get_service_group_runtime_stats` - Service group runtime statistics

## Testing

Verify your installation:

```bash
cd alteon-mcp-server
npm test
```

Expected output:
```
🎉 SUCCESS: All 24 tools are working perfectly!

📋 Tool Categories:
   • Phase 1: 7 Core Monitoring Tools
   • Phase 2: 3 Server & Group Management Tools
   • Phase 3: 4 Network Topology Tools
   • Phase 4: 4 Configuration Validation Tools
   • Phase 5: 6 Runtime Statistics & Health Monitoring Tools

✨ Ready for production deployment!
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
│   └── index.ts          # Main MCP server implementation (24 tools)
├── dist/                 # Compiled JavaScript (npm package)
├── test-all-24-tools.mjs # Comprehensive test suite
├── package.json          # NPM package configuration
└── tsconfig.json         # TypeScript configuration
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
