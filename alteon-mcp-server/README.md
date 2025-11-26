# Alteon MCP Server

[![npm version](https://img.shields.io/npm/v/alteon-mcp-server.svg)](https://www.npmjs.com/package/alteon-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![MCP Protocol](https://img.shields.io/badge/MCP-v0.5.0-blue.svg)](https://modelcontextprotocol.io)

Professional Model Context Protocol (MCP) server for Radware Alteon Application Delivery Controllers. Provides comprehensive monitoring, topology discovery, configuration validation, and management capabilities through AI-powered interfaces.

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
- VLAN detailed configuration
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

- ✅ **Production Ready**: Thoroughly tested with 100% pass rate (24/24 tools)
- ✅ **Safe Operations**: Read-only validation tools, no configuration changes
- ✅ **AI-Powered**: Integrates with Claude, ChatGPT, and other MCP-compatible AI systems
- ✅ **TypeScript**: Fully typed for reliability and maintainability
- ✅ **REST API**: Clean integration with Alteon REST API
- ✅ **Enterprise Grade**: Designed for professional network operations
- ✅ **Runtime Monitoring**: Real-time operational statistics and health checks

## Installation

### NPM Installation (Recommended)

```bash
npm install -g alteon-mcp-server
```

### From Source

```bash
git clone https://github.com/rdwr-seanr/alteon-mcp-server.git
cd alteon-mcp-server
npm install
npm run build
```

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Alteon Device**: With REST API enabled
- **Network Access**: HTTPS connectivity to Alteon
- **Credentials**: Valid admin credentials

## Configuration

Configure your MCP client to connect to your Alteon device. The server supports multiple configuration methods:

### Claude Desktop Configuration

Add to your Claude Desktop config file (`claude_desktop_config.json`):

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "alteon": {
      "command": "node",
      "args": [
        "C:\\path\\to\\alteon-mcp-server\\dist\\index.js"
      ],
      "env": {
        "ALTEON_HOST": "10.210.240.96",
        "ALTEON_USERNAME": "admin",
        "ALTEON_PASSWORD": "admin"
      }
    }
  }
}
```

### LM Studio Configuration

Create `lm-studio-config.json` in the project root:

```json
{
  "host": "10.210.240.96",
  "username": "admin",
  "password": "admin"
}
```

### Environment Variables

```bash
# Linux/macOS
export ALTEON_HOST=10.210.240.96
export ALTEON_USERNAME=admin
export ALTEON_PASSWORD=admin

# Windows PowerShell
$env:ALTEON_HOST="10.210.240.96"
$env:ALTEON_USERNAME="admin"
$env:ALTEON_PASSWORD="admin"
```

## Usage

### With Claude Desktop

Once configured, simply ask Claude natural language questions about your Alteon device:

```
"Show me the status of all real servers"
"Which service groups have unhealthy members?"
"Generate a configuration audit report"
"Check if there are any pending configuration changes"
"What's the current network topology?"
"Show me traffic statistics for port 2"
"List all IP interfaces and their VLANs"
```

### With LM Studio

1. Start LM Studio and load your preferred model
2. Enable MCP servers in settings
3. The Alteon tools will be available for the AI to use
4. Ask questions naturally about your network infrastructure

### Command Line Testing

Verify your installation and connectivity:

```bash
# Run comprehensive test suite
npm test

# Expected output: 24/24 tests passing (100% success rate)
```

### Example Outputs

**Real Server Status:**
```
Server 1: 10.210.240.5 (Web-Server-1)
  Status: Enabled
  State: Up
  Weight: 1
  Max Connections: 10000
```

**Configuration Validation:**
```
Configuration Synchronization Status:
✅ Real Servers: Synchronized (3 pending, 3 active)
✅ Service Groups: Synchronized
✅ VLANs: Synchronized

Validation: All configurations in sync
```

**Network Topology:**
```
Network Topology Summary:
- VLANs: 6 configured
- IP Interfaces: 4 configured
- Real Servers: 3 active
- Service Groups: 4 configured
```

## Available Tools

### Monitoring Tools
- `get_real_server_status` - Get all real servers with health status
- `get_service_group_status` - Get all service groups with member counts
- `get_virtual_service_status` - Get all virtual services
- `get_system_health` - Get system health metrics
- `get_vlan_info` - Get VLAN configuration
- `get_traffic_stats` - Get network traffic statistics
- `check_device_status` - Get overall device status

### Management Tools
- `list_real_servers` - List all real servers with details
- `get_service_group_details` - Get detailed service group configuration
- `get_health_check_status` - Get health check status for all servers

### Topology Tools
- `get_ip_interfaces` - Get IP interface configuration
- `get_vlan_details` - Get detailed VLAN information
- `get_network_summary` - Get complete network topology
- `get_gateway_config` - Get gateway configuration

### Validation Tools
- `check_config_sync` - Check configuration synchronization status
- `validate_server_config` - Validate real server configurations
- `validate_service_group` - Validate service group configurations
- `generate_config_report` - Generate comprehensive audit report

### Runtime Statistics & Health Monitoring (Phase 5)
- `get_virtual_service_details` - Get detailed virtual service configuration
- `get_virtual_server_runtime_stats` - Get real-time virtual server statistics
- `get_virtual_service_runtime_stats` - Get per-service runtime statistics
- `get_real_server_operational_stats` - Get real-time real server statistics
- `get_real_server_operational_info` - Get real server operational info
- `get_service_group_runtime_stats` - Get service group runtime statistics

## Requirements

- **Node.js**: 18.0.0 or higher
- **Alteon ADC**: Compatible with REST API (tested on v32+)
- **Network Access**: HTTPS connectivity to Alteon device
- **Credentials**: Valid Alteon admin credentials

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Clean build artifacts
npm run clean
```

## Testing

The project includes comprehensive test coverage:

```bash
npm test
```

Expected output:
```
🎉 SUCCESS! All 24 tools are working perfectly!

📋 Tool Categories:
   • Phase 1: 7 Core Monitoring Tools
   • Phase 2: 3 Server & Group Management Tools
   • Phase 3: 4 Network Topology Tools
   • Phase 4: 4 Configuration Validation Tools
   • Phase 5: 6 Runtime Statistics & Health Monitoring Tools

✨ Ready for production deployment!
```

## Architecture

```
alteon-mcp-server/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (npm package)
├── test-all-24-tools.mjs # Comprehensive test suite
├── package.json          # NPM package configuration
└── tsconfig.json         # TypeScript configuration
```

## Security Considerations

- **HTTPS Only**: All communication uses HTTPS (self-signed certs accepted)
- **Credentials**: Store credentials securely using environment variables
- **Read-Only**: All tools are read-only, no configuration changes
- **Validation**: Extensive input validation and error handling
- **Network**: Ensure proper network segmentation for management access

## Troubleshooting

### Connection Issues

```bash
# Test Alteon connectivity
curl -k https://10.210.240.96/config/SlbCurCfgEnhRealServerTable -u admin:admin
```

### Tool Failures

- Verify Alteon firmware version (REST API availability varies)
- Check credentials and network connectivity
- Review tool logs for specific error messages
- Some advanced tools require specific Alteon features

### Common Issues

**404 Errors**: Some API endpoints may not be available on older Alteon versions
**Timeout Errors**: Increase timeout in axios configuration
**Auth Errors**: Verify username/password and account permissions

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and future development.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**Sean Ramati**
- Email: seanramati95@gmail.com
- GitHub: [@rdwr-seanr](https://github.com/rdwr-seanr)

## Acknowledgments

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Designed for [Radware Alteon ADC](https://www.radware.com/products/alteon/)
- Inspired by the need for AI-powered network operations

## Support

- 📖 [Documentation](https://github.com/rdwr-seanr/alteon-mcp-server#readme)
- 🐛 [Issue Tracker](https://github.com/rdwr-seanr/alteon-mcp-server/issues)
- 💬 [Discussions](https://github.com/rdwr-seanr/alteon-mcp-server/discussions)

---

**⚡ Built for AI-Powered Network Operations**
