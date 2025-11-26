# Development Branch Strategy

## Overview

This repository uses a **two-branch workflow** following Git best practices:

- **`main`** - Production-ready code for customers (clean, stable, published)
- **`dev`** - Development branch with all work-in-progress, API docs, and testing files

---

## Branch Purposes

### `main` Branch (Customer-Facing)
**What's Here:**
- Production-ready code only
- Customer-facing README
- Clean, minimal structure
- Published NPM package files
- No development artifacts

**What's NOT Here:**
- API documentation files
- Testing/debugging scripts
- Internal development notes
- Work-in-progress features

**When to Push:**
- Only after thorough testing
- When releasing a new version
- After updating documentation

### `dev` Branch (Development Work)
**What's Here:**
- All development work and experiments
- `docs/alteon-34/` - Alteon API reference documentation (47 HTML files)
- `ROADMAP.md` - Future development plans
- All testing and debugging scripts
- Internal notes and guides
- Work-in-progress features

**What's NOT in Main:**
- Development documentation stays here
- API reference files stay here
- Testing tools stay here

---

## Workflow

### Daily Development (on `dev` branch)

1. **Make sure you're on dev:**
   ```powershell
   git checkout dev
   git pull origin dev
   ```

2. **Do your work:**
   - Implement new features
   - Test against Alteon device
   - Update ROADMAP as needed
   - Reference API docs in `docs/alteon-34/`
   - Run test suite

3. **Commit regularly:**
   ```powershell
   git add .
   git commit -m "Descriptive message about your changes"
   ```

4. **Push to dev branch:**
   ```powershell
   git push origin dev
   ```

### Release to Production (merge to `main`)

When ready to release a new version:

1. **Ensure you're on dev with all changes committed:**
   ```powershell
   git checkout dev
   git status  # Should be clean
   ```

2. **Update version and changelog:**
   ```powershell
   cd alteon-mcp-server
   npm version patch  # or minor, or major
   ```

3. **Test everything:**
   ```powershell
   cd alteon-mcp-server
   node test-all-18-tools.mjs  # Should be 18/18 passing
   ```

4. **Build production code:**
   ```powershell
   cd alteon-mcp-server
   npm run build
   ```

5. **Switch to main and merge ONLY production files:**
   ```powershell
   git checkout main
   git merge --no-commit --no-ff dev
   ```

6. **Remove development files from staging:**
   ```powershell
   git reset HEAD docs/
   git reset HEAD DEV-BRANCH-README.md
   git reset HEAD ROADMAP.md
   # Remove any test scripts or debugging files
   git checkout -- docs/
   git checkout -- DEV-BRANCH-README.md
   git checkout -- ROADMAP.md
   ```

7. **Commit and push to main:**
   ```powershell
   git commit -m "Release v1.7.0: Add session monitoring and routing tools"
   git push origin main
   ```

8. **Create GitHub release:**
   - Go to GitHub repository
   - Click "Releases" → "Create a new release"
   - Tag: `v1.7.0`
   - Title: `Version 1.7.0 - Session Monitoring & Routing`
   - Description: Copy from CHANGELOG.md

9. **Publish to NPM:**
   ```powershell
   cd alteon-mcp-server
   npm publish
   ```

10. **Switch back to dev:**
    ```powershell
    git checkout dev
    ```

---

## Alternative: Selective File Release (Easier Method)

If you want a simpler approach where you manually control what goes to main:

1. **Stay on dev for all development:**
   ```powershell
   git checkout dev
   # ... do all your work ...
   git add .
   git commit -m "Your changes"
   git push origin dev
   ```

2. **When ready to release, cherry-pick only production files to main:**
   ```powershell
   git checkout main
   
   # Copy only the production files manually
   cp -r alteon-mcp-server/src/* alteon-mcp-server/src/
   cp -r alteon-mcp-server/dist/* alteon-mcp-server/dist/
   cp alteon-mcp-server/package.json alteon-mcp-server/
   cp alteon-mcp-server/CHANGELOG.md alteon-mcp-server/
   cp README.md .
   
   git add alteon-mcp-server/src alteon-mcp-server/dist alteon-mcp-server/package.json alteon-mcp-server/CHANGELOG.md README.md
   git commit -m "Release v1.7.0"
   git push origin main
   
   git checkout dev
   ```

---

## What Lives Where

### Files in BOTH Branches:
- `README.md` (customer-facing)
- `alteon-mcp-server/src/` (source code)
- `alteon-mcp-server/dist/` (compiled code)
- `alteon-mcp-server/package.json`
- `alteon-mcp-server/CHANGELOG.md`
- `alteon-mcp-server/CONTRIBUTING.md`
- `alteon-mcp-server/LICENSE`
- `.gitignore`

### Files ONLY in `dev` Branch:
- `docs/alteon-34/` - API documentation (47 files)
- `ROADMAP.md` - Future development plans
- `DEV-BRANCH-README.md` - This file
- All test scripts (test-*.mjs, debug-*.mjs, etc.)
- Internal development notes
- Experimental features

### Files NEVER in Git:
- `node_modules/`
- `*.log`
- `.env` files with credentials
- IDE-specific files (unless .gitignore allows)

---

## Quick Reference Commands

```powershell
# Check which branch you're on
git branch

# Switch to dev for development
git checkout dev

# Switch to main for release
git checkout main

# See what's different between branches
git diff main dev

# See files only in dev branch
git diff main dev --name-status

# Push current branch to GitHub
git push origin <branch-name>

# Pull latest from GitHub
git pull origin <branch-name>
```

---

## Best Practices

1. **Never work directly on `main`** - Always develop on `dev`
2. **Keep main clean** - No debugging files or API docs
3. **Test before merging to main** - Run full test suite
4. **Update CHANGELOG** - Document all changes before release
5. **Version bumps** - Use `npm version` for proper versioning
6. **Commit messages** - Be descriptive about what changed
7. **Regular backups** - Push to GitHub frequently

---

## Troubleshooting

### "I accidentally worked on main instead of dev!"
```powershell
# If you haven't committed yet:
git checkout dev  # This brings your changes with you

# If you already committed to main:
git checkout main
git log -1  # Note the commit hash
git checkout dev
git cherry-pick <commit-hash>
git checkout main
git reset --hard HEAD~1  # Remove the commit from main
```

### "I want to see what's different between branches"
```powershell
git diff main dev -- alteon-mcp-server/src/
```

### "I merged too much into main!"
```powershell
git checkout main
git reset --hard origin/main  # Reset to GitHub version
# Then try the release process again more carefully
```

---

## Why This Approach?

**Benefits:**
- ✅ Customers only see production-ready, clean code
- ✅ You have full development flexibility on `dev`
- ✅ Easy to experiment without affecting production
- ✅ Clear separation between dev and production
- ✅ Can reference API docs during development
- ✅ Testing tools available in dev, hidden from customers
- ✅ Follows Git best practices used by major projects

**This is exactly how most professional projects work!** Examples:
- Linux kernel (torvalds/linux)
- Node.js (nodejs/node)  
- React (facebook/react)

---

## Current Status

- **`main` branch**: v1.6.0 production release (18 tools)
- **`dev` branch**: v1.6.0 + ROADMAP + API docs (ready for Phase 5 development)
- **Next release**: v1.7.0 (Phase 5 tools - session monitoring, routing, ARP)

---

**Happy coding! 🚀**
