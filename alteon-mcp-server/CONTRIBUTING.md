# Contributing to Alteon MCP Server

First off, thank you for considering contributing to Alteon MCP Server! It's people like you that make this tool better for everyone.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Exact steps to reproduce**
- **Expected vs actual behavior**
- **Environment details** (Node.js version, Alteon firmware, OS)
- **Error messages or logs**

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Clear use case** - Why is this enhancement needed?
- **Detailed description** - How should it work?
- **Examples** - Show expected behavior
- **Alternatives considered** - What other approaches did you think about?

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Test your changes** - Ensure all tests pass
3. **Update documentation** - Keep README.md and code comments current
4. **Follow code style** - Use TypeScript best practices
5. **Write clear commit messages** - Explain what and why

## Development Process

### Setup

```bash
git clone https://github.com/YOUR-USERNAME/alteon-mcp-server.git
cd alteon-mcp-server
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

All 18 tests must pass before submitting PR.

### Code Style

- **TypeScript**: Use strict typing, no `any` types
- **Formatting**: 2-space indentation, semicolons
- **Comments**: Document complex logic and API interactions
- **Error Handling**: Always handle errors gracefully

### Adding New Tools

When adding new MCP tools:

1. **Define tool schema** in `tools` array
2. **Implement handler** in `switch` statement
3. **Add test** in `test-all-18-tools.mjs`
4. **Update README.md** with tool documentation
5. **Update version** following semver

### Testing

Test against a live Alteon device or simulator:

```bash
# Set credentials
export ALTEON_HOST=10.210.240.96
export ALTEON_USERNAME=admin
export ALTEON_PASSWORD=admin

# Run tests
npm test
```

### Commit Messages

Follow conventional commits:

```
feat: add new tool for BGP status
fix: correct error handling in health checks
docs: update installation instructions
test: add test for VLAN validation
refactor: simplify API client creation
```

## Project Structure

```
alteon-mcp-server/
├── src/
│   └── index.ts              # Main server implementation
├── dist/                     # Compiled output
├── test-all-18-tools.mjs     # Test suite
├── package.json              # NPM configuration
├── tsconfig.json             # TypeScript config
└── README.md                 # Documentation
```

## Questions?

Feel free to open an issue for questions or discussion.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
