# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2025-11-26

### Added - Phase 5: Complete Core Load Balancing Monitoring 🎯
**8 new tools focused on runtime statistics and operational monitoring:**

#### Virtual Server & Services Runtime Stats
- `get_virtual_service_details` - Get detailed virtual service (port/protocol) configuration per VS
- `get_virtual_server_runtime_stats` - Real-time VS operational statistics (connections, bytes, packets)
- `get_virtual_service_runtime_stats` - Per-service operational stats using /oper/ endpoints

#### Real Server Operational Statistics  
- `get_real_server_operational_stats` - Real-time RS statistics (connections, throughput, health)
- `get_real_server_operational_info` - RS operational state, health check results, failure reasons

#### Service Group Runtime Statistics
- `get_service_group_runtime_stats` - Real-time group statistics (connections, throughput, active servers)

#### Health Check Monitoring
- `get_health_check_config` - Health check definitions (type, interval, timeout, thresholds)
- `get_health_check_results` - Current health check results and failure reasons

### Changed
- **Total tools**: 18 → 26 tools (44% increase)
- **API coverage**: ~15% → ~26% of available Alteon GET endpoints
- Comprehensive test suite updated to test-all-26-tools.mjs
- Enhanced package.json description for runtime statistics
- Version bumped to 1.7.0 across all files

### Fixed
- /oper/ endpoint compatibility checks in test suite
- Graceful handling of endpoints not available on older Alteon firmware

### Test Results
- 24/26 tests passed (92% success rate)
- 2 tests skipped due to Alteon version API availability
- All core functionality verified and working

### Technical Details
- Uses /oper/ endpoints for real-time operational data
- Falls back gracefully when /oper/ not available
- Backward compatible with v1.6.0 configuration tools
- Production-ready code quality maintained

## [1.6.0] - 2025-11-25

### Added - Phase 4: Configuration Validation Tools
- `check_config_sync` - Compare pending vs active configuration, detect unsaved changes
- `validate_server_config` - Validate real server configurations for issues and best practices
- `validate_service_group` - Validate service group configurations and member health
- `generate_config_report` - Generate comprehensive audit reports with recommendations

### Changed
- Updated comprehensive test suite to cover all 18 tools (100% pass rate)
- Enhanced professional documentation for NPM publication
- Improved package.json metadata for discoverability

### Fixed
- Test suite compatibility across different Alteon firmware versions

## [1.5.0] - 2025-11-25

### Added - Phase 3: Network Topology Tools
- `get_ip_interfaces` - Retrieve IP interface configurations
- `get_vlan_details` - Get detailed VLAN information with port assignments
- `get_network_summary` - Generate complete network topology overview
- `get_gateway_config` - Retrieve gateway configurations

### Changed
- Updated README with Phase 3 tools documentation
- Enhanced test coverage to 14 tools

## [1.4.0] - 2025-11-25

### Added
- `get_health_check_status` - Comprehensive health check status for servers and groups

### Changed
- Improved error handling and validation
- Enhanced documentation with usage examples

## [1.3.0] - 2025-11-25

### Added - Phase 2: Server & Group Management
- `list_real_servers` - List all real servers with detailed configuration
- `get_service_group_details` - Get service group details with member information

### Changed
- Refactored API client for better reusability
- Updated test suite for new tools

## [1.2.0] - 2025-11-25

### Added
- `get_traffic_stats` - Network traffic statistics per port
- `check_device_status` - Overall device health summary

### Fixed
- Error handling for missing API endpoints
- Timeout configuration for slow networks

## [1.1.0] - 2025-11-25

### Added
- `get_system_health` - System health metrics (CPU, memory, disk, temperature)
- `get_vlan_info` - VLAN configuration and status

### Changed
- Improved error messages for API failures
- Enhanced documentation

## [1.0.0] - 2025-11-25

### Added - Initial Release
- Core MCP server implementation
- `get_real_server_status` - Real server monitoring
- `get_service_group_status` - Service group monitoring
- `get_virtual_service_status` - Virtual service monitoring
- Basic test suite
- README and documentation

### Infrastructure
- TypeScript build system
- MCP SDK v0.5.0 integration
- Axios-based REST API client
- Environment-based configuration
