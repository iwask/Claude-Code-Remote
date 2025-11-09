# Suggested Commands for Development

## Installation & Setup
```bash
# Clone and install
git clone https://github.com/JessyTsui/Claude-Code-Remote.git
cd Claude-Code-Remote
npm install

# Setup configuration
cp .env.example .env
# Edit .env with your settings
nano .env
```

## Running Services

### Start All Enabled Platforms
```bash
npm run webhooks
# or
node start-all-webhooks.js
```

### Individual Platform Services
```bash
# Email daemon
npm run daemon:start    # Start
npm run daemon:stop     # Stop
npm run daemon:status   # Check status

# Telegram webhook
npm run telegram
# or
node start-telegram-webhook.js

# LINE webhook
npm run line
# or
node start-line-webhook.js

# PTY relay
npm run relay:pty
# or
npm run relay:start
```

## Testing & Diagnostics
```bash
# Test all notification channels
node claude-hook-notify.js completed
node claude-hook-notify.js waiting

# Platform-specific tests
node test-telegram-notification.js
node test-real-notification.js
node test-injection.js
node test-complete-flow.sh

# System diagnostics
node claude-remote.js diagnose
node claude-remote.js status
node claude-remote.js test
```

## tmux Session Management
```bash
# Start Claude in tmux
tmux new-session -d -s claude-session
tmux attach-session -t claude-session

# Inside tmux, start Claude Code with hooks
claude-code --config /path/to/claude/settings.json

# Detach from tmux (keep Claude running)
# Press: Ctrl+B, then D

# List tmux sessions
tmux list-sessions

# Reattach to session
tmux attach-session -t claude-session
```

## Telegram Setup (macOS/Linux)
```bash
chmod +x setup-telegram.sh
./setup-telegram.sh

# Or test manually
bash test-telegram-setup.sh
```

## Git Workflow
```bash
# Standard git commands
git status
git add .
git commit -m "message"
git push

# Branch management
git checkout -b feature/new-feature
git merge main
```

## Debugging
```bash
# Enable debug logging
LOG_LEVEL=debug npm run webhooks
DEBUG=true node claude-hook-notify.js completed

# Check environment
cat .env
echo $CLAUDE_HOOKS_CONFIG

# Monitor logs
tail -f logs/*.log  # if logs directory exists
```

## System Utilities (macOS specific)
```bash
# File operations
ls -la
find . -name "*.json"
grep -r "pattern" src/

# Process management
ps aux | grep node
pkill -f "node.*webhook"

# Network
netstat -an | grep LISTEN
lsof -i :3000
```