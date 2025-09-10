# Changelog

All notable changes to the Alteon MCP Server project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-10

### Added
- Initial release of Alteon MCP Server
- Four core MCP tools for Alteon device interaction:
  - `get_system_info` - Basic system information retrieval
  - `get_vlan_table` - VLAN configuration with decoded port numbers
  - `get_dns_config` - DNS client configuration retrieval
  - `get_interface_stats` - Interface status and configuration
- TypeScript implementation with comprehensive error handling
- Port bitmask decoding for readable VLAN port assignments
- SSL certificate verification bypass for lab environments
- Comprehensive documentation and setup guides
- Test suite for validation
- LM Studio integration configuration

### Technical Features
- Model Context Protocol (MCP) compliance
- RESTful API integration with Alteon devices
- JSON-RPC 2.0 protocol implementation
- Axios-based HTTP client with authentication
- Professional TypeScript codebase with proper typing

### Documentation
- Complete setup guide for LM Studio integration
- Comprehensive README with examples
- API reference and troubleshooting guides
- Educational comments throughout codebase

### Testing
- Automated test suite for all MCP tools
- Real device validation (tested with Alteon at 10.210.240.23)
- Error handling and edge case coverage
