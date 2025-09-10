# Development Setup Guide

This guide is for developers who want to extend the Alteon MCP Server functionality.

## 🔧 Development Environment Setup

### 1. Clone and Basic Setup
```bash
git clone https://github.com/YOUR-USERNAME/alteon-mcp-server.git
cd alteon-mcp-server/alteon-mcp-server
npm install
npm run build
```

### 2. API Documentation (Optional)

The Alteon REST API documentation is **not included** in this repository to keep it clean and avoid licensing issues.

**If you need API reference during development:**

1. **Get docs from your Alteon device:**
   - Access your Alteon web interface
   - Navigate to Help → API Documentation
   - Download or bookmark the API reference

2. **Create local docs folder (gitignored):**
   ```bash
   mkdir docs
   mkdir docs/alteon-34
   # Place your API .htm files here
   ```

3. **Alternative sources:**
   - Radware's official documentation portal
   - Your Alteon device's built-in help
   - Support portal (with valid license)

### 3. Development Workflow

```bash
# Development with watch mode
npm run dev

# Test with your device
# Edit test.mjs to update IP/credentials
node test.mjs

# Add new API endpoints
# Edit src/index.ts
# Add new tools following existing patterns

# Build and test
npm run build
npm test
```

### 4. Adding New Tools

1. **Research the API:** Use the Alteon web interface or documentation
2. **Test manually:** Use tools like curl or Postman to verify endpoints
3. **Add tool definition:** Follow the pattern in `src/index.ts`
4. **Update test script:** Add test cases for new functionality
5. **Document:** Update README with new tool descriptions

### 5. Common API Endpoints to Explore

Based on Alteon REST API structure:
- `/config/<TableName>` - Get table data
- `/config?prop=<property>` - Get scalar values
- `/config/<operation>` - System operations

### 6. Development Tips

- **SSL Issues:** The code disables SSL verification for lab environments
- **Authentication:** Uses basic auth (username/password)
- **Error Handling:** Check response.status and response.data for errors
- **Port Decoding:** Use the existing `decodePortBitmask()` function for VLAN ports
- **Testing:** Always test with actual Alteon device, not simulators

### 7. File Structure

```
├── src/index.ts           # Main MCP server code
├── test.mjs              # Test script (update with your device)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── lm-studio-config.json # LM Studio integration
└── docs/                 # Your local API docs (gitignored)
```

### 8. Debugging

- **Enable debug logging:** Add console.log statements in src/index.ts
- **Test individual APIs:** Use browser or curl to test Alteon endpoints
- **Check network:** Verify connectivity to Alteon device
- **Validate JSON:** Ensure API responses are valid JSON

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-tool`
3. Add your changes and tests
4. Update documentation
5. Submit a pull request

## 📚 Resources

- [Model Context Protocol Specification](https://github.com/modelcontextprotocol/specification)
- [Radware Alteon Documentation](https://www.radware.com/support/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Note:** This project is educational and designed to demonstrate MCP concepts while providing real value for Alteon management.
