# Task Completion Checklist

## When You Complete a Coding Task

### 1. Code Quality
- [ ] **Follow code style**: Use established conventions (CommonJS, camelCase, etc.)
- [ ] **Add documentation**: JSDoc comments for new functions/classes
- [ ] **Error handling**: Wrap risky operations in try-catch blocks
- [ ] **Logging**: Add appropriate log statements (debug, info, error)

### 2. Testing
- [ ] **Manual testing**: Since there's no automated test suite, test manually
- [ ] **Test scripts**: Use existing test scripts when applicable
  ```bash
  node test-telegram-notification.js  # For Telegram changes
  node test-injection.js              # For command injection changes
  node claude-hook-notify.js completed # Test notifications
  ```
- [ ] **Integration testing**: Test end-to-end flow if multiple components changed
  ```bash
  bash test-complete-flow.sh
  ```

### 3. Configuration
- [ ] **Update .env.example**: If new environment variables were added
- [ ] **Update config files**: Modify relevant config JSON files if needed
- [ ] **Documentation**: Update README.md or relevant docs for new features

### 4. Dependencies
- [ ] **package.json**: Add new dependencies if any were used
- [ ] **Compatibility**: Ensure Node.js >= 14.0.0 compatibility
- [ ] **Platform support**: Test on macOS if possible (primary platform)

### 5. Git Workflow
- [ ] **Review changes**: Check `git status` and `git diff`
- [ ] **Commit message**: Write clear, descriptive commit message
  ```bash
  git add .
  git commit -m "feat: add new feature description"
  # or
  git commit -m "fix: resolve bug description"
  ```
- [ ] **Push changes**: Push to appropriate branch
  ```bash
  git push origin branch-name
  ```

### 6. No Automated Checks
⚠️ **Note**: This project does not have:
- Linting (no ESLint)
- Formatting (no Prettier)
- Unit tests (no Jest/Mocha)
- CI/CD pipelines

Therefore, **manual verification is critical**.

### 7. For New Features
- [ ] **Add test script**: Create a test-*.js file if appropriate
- [ ] **Update README.md**: Document new features and usage
- [ ] **Update CHANGELOG**: Add entry to changelog section in README.md
- [ ] **Example configuration**: Add examples to .env.example or docs

### 8. Deployment Considerations
- [ ] **Environment variables**: Ensure all required env vars are documented
- [ ] **tmux compatibility**: Test with actual tmux sessions if relevant
- [ ] **Webhook setup**: Test webhook endpoints if modified
- [ ] **Session management**: Verify session creation/cleanup works correctly

## Quick Test Commands
```bash
# Test notification system
node claude-hook-notify.js completed

# Test Telegram
node test-telegram-notification.js

# Test command injection
node test-injection.js

# Full flow test
bash test-complete-flow.sh

# Check daemon status
npm run daemon:status
```