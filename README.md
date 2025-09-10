# Alteon MCP Server

A Model Context Protocol (MCP) server for interacting with Alteon Application Delivery Controllers via REST API.

## 🎯 Overview

This project provides a simple, educational MCP server that enables AI assistants (like LM Studio) to interact with Alteon devices through natural language queries. Perfect for learning how MCP works while solving real networking automation needs!

## ✨ Features

- **5 Core Tools** for Alteon interaction:
  - `get_system_info` - Basic system information
  - `get_vlan_table` - VLAN configuration with decoded port numbers
  - `get_dns_config` - DNS client settings  
  - `get_interface_stats` - Interface status with readable formatting
  - `get_port_traffic_stats` - **NEW!** Detailed traffic analytics with error monitoring

- **Advanced Traffic Analytics**:
  - Human-readable byte/packet formatting (GB, MB, K, M suffixes)
  - Packet breakdown by type (unicast, broadcast, multicast)
  - Error and discard monitoring with health assessment
  - Traffic utilization indicators
  - Per-port filtering capabilities

- **Intelligent Data Processing**:
  - Converts hex port bitmasks to readable port numbers
  - Formats interface speeds and statuses
  - Professional traffic statistics presentation
  - Handles authentication and SSL for lab environments

- **Educational Design**:
  - Well-commented TypeScript code
  - Simple, understandable architecture
  - Step-by-step setup guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- LM Studio or compatible MCP client
- Alteon device with REST API enabled

### Installation

1. **Clone and build:**
```bash
git clone <your-repo-url>
cd small-alteon-mcp/alteon-mcp-server
npm install
npm run build
```

2. **Test with your device:**
```bash
node test-improved.mjs
```

3. **Configure LM Studio:**
   - Copy configuration from `lm-studio-config.json`
   - Follow detailed steps in `SETUP-GUIDE.md`

## 📊 Example Outputs

### VLAN Configuration (Before vs After)
**Before Fix:**
```
VlanId 1: Ports: 40:00:00:00:00:00:00:00  ❌ Cryptic hex
```

**After Fix:**
```
VLAN 1: Default VLAN
  Status: Enabled
  Ports: [2]                             ✅ Readable ports
  Raw Port Mask: 40:00:00:00:00:00:00:00
```

### Interface Information
```
Port 1:
  Speed: Auto
  Link Status: Down  
  Operational Status: Up
  Description: utp ethernet (10/100/1000)
  MAC Address: 00:03:b2:80:00:40
```

### Traffic Statistics (NEW!)
```
Port 2 Traffic Statistics:
  📊 Traffic Volume:
    Inbound:  1.06 GB (18.77M unicast pkts)
    Outbound: 2 GB (35.72M unicast pkts)
    Utilization: High
  📦 Packet Breakdown:
    IN  - Unicast: 18.77M, Broadcast: 3.22K, Multicast: 150.89K
    OUT - Unicast: 35.72M, Broadcast: 12.39K, Multicast: 0
  ⚠️  Errors & Discards:
    IN  - Errors: 0, Discards: 0, Unknown Protocols: 0
    OUT - Errors: 0, Discards: 0, Queue Length: 0
  🏥 Health Status: ✅ Healthy
```

## 🗂️ Project Structure

```
small-alteon-mcp/
├── alteon-mcp-server/          # MCP server implementation
│   ├── src/index.ts            # Main server code (well-commented)
│   ├── dist/                   # Compiled JavaScript
│   ├── package.json            # Dependencies
│   ├── test-improved.mjs       # Test script
│   └── lm-studio-config.json   # LM Studio configuration
├── docs/alteon-34/             # Alteon API documentation  
├── SETUP-GUIDE.md              # Step-by-step LM Studio setup
├── ISSUES-FIXED.md             # Technical details of fixes
└── README.md                   # This file
```

## 🎓 Learning MCP

This project demonstrates key MCP concepts:

1. **Tool Definition** - How to define available functions
2. **Parameter Handling** - Input validation and processing  
3. **External API Integration** - Making authenticated HTTP requests
4. **Response Formatting** - Converting technical data to readable format
5. **Error Handling** - Graceful failure management

## 🔧 API Integration Details

### Alteon REST API Structure
- **Base URL**: `https://<device-ip>/config/`
- **Authentication**: Basic Auth (username/password)
- **Response Format**: JSON
- **SSL**: Disabled for lab environments (configurable)

### Data Processing
- **Port Decoding**: Converts hex bitmasks to port numbers
- **Status Mapping**: Translates numeric codes to readable strings
- **Speed Formatting**: Maps speed codes to bandwidth labels

## 🔍 Tested With
- **Device**: Alteon Application Switch
- **Version**: Various (API-compatible)
- **Environment**: Lab setup with self-signed certificates
- **MCP Client**: LM Studio

## 🛠️ Troubleshooting

### Common Issues
1. **Connection Errors**: Verify Alteon IP and REST API enabled
2. **Authentication**: Check username/password credentials  
3. **SSL Issues**: Server disables verification for lab use
4. **Empty Responses**: Some OIDs may not exist on all Alteon versions

### Debug Commands
```bash
# Test MCP server
node test-improved.mjs

# Test specific functionality  
node investigate.mjs

# Rebuild after changes
npm run build
```

## 📚 Documentation

- [`ROADMAP.md`](ROADMAP.md) - Future development plans and feature roadmap
- [`CHANGELOG.md`](CHANGELOG.md) - Version history and release notes
- [`docs/alteon-34/`](docs/alteon-34/) - Alteon REST API reference

## 🚀 Future Development

See our comprehensive [Development Roadmap](ROADMAP.md) for planned features including:
- **Phase 2**: Real server health monitoring, enhanced analytics
- **Phase 3**: Safe configuration management, policy automation  
- **Phase 4**: Multi-device clusters, AI-powered diagnostics

## 🤝 Contributing

This is an educational project that's growing into a production platform! Ways to contribute:
- **Easy**: Add support for more Alteon models, improve error messages
- **Medium**: Implement new monitoring tools, add configuration validation
- **Advanced**: Design plugin architecture, build automated diagnostics

Check our [roadmap](ROADMAP.md) for detailed contribution opportunities.

## ⚠️ Security Notes

- SSL verification disabled for lab environments
- Credentials passed as parameters (consider environment variables for production)
- Local execution only (no remote access)

## 📄 License

MIT License - Feel free to use this for learning and automation!

---

**Built with ❤️ for the networking automation community**

*Perfect for learning MCP while solving real network management challenges!*
