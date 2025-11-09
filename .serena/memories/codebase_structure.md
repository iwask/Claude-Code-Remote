# Codebase Structure

## Directory Layout

```
Claude-Code-Remote/
├── src/                          # Source code
│   ├── channels/                 # Notification channel implementations
│   │   ├── base/                 # Base channel class
│   │   ├── telegram/             # Telegram bot integration
│   │   │   ├── telegram.js       # Telegram channel class
│   │   │   └── webhook.js        # Webhook handler
│   │   ├── line/                 # LINE messaging integration
│   │   ├── email/                # Email (SMTP/IMAP) integration
│   │   ├── discord/              # Discord integration
│   │   └── local/                # Local/desktop notifications
│   ├── core/                     # Core functionality
│   ├── utils/                    # Utility functions
│   │   ├── tmux-monitor.js       # tmux session monitoring
│   │   ├── controller-injector.js # Command injection
│   │   ├── trace-capture.js      # Execution trace capture
│   │   ├── subagent-tracker.js   # Track subagent activities
│   │   └── conversation-tracker.js # Track conversations
│   ├── daemon/                   # Daemon processes
│   ├── relay/                    # PTY relay functionality
│   │   └── relay-pty.js          # PTY-based relay
│   ├── data/                     # Runtime data
│   │   └── sessions/             # Session files (*.json)
│   └── config-manager.js         # Configuration management
├── config/                       # Configuration files
│   ├── default.json              # Default configuration
│   ├── channels.json             # Channel configurations
│   ├── user.json                 # User-specific config
│   └── defaults/                 # Default templates
│       ├── config.json
│       ├── claude-hooks.json
│       └── i18n.json
├── assets/                       # Static assets (images, demos)
├── .github/                      # GitHub workflows and templates
├── .serena/                      # Serena configuration
├── .claude/                      # Claude Code configuration
│
├── Root Level Scripts:
├── claude-hook-notify.js         # Hook notification handler (main entry)
├── claude-remote.js              # Main CLI tool
├── smart-monitor.js              # Smart monitoring for Claude responses
├── start-telegram-webhook.js     # Telegram webhook starter
├── start-line-webhook.js         # LINE webhook starter
├── start-all-webhooks.js         # Start all webhooks
├── start-relay-pty.js            # PTY relay starter
│
├── Test Scripts:
├── test-telegram-notification.js # Test Telegram notifications
├── test-real-notification.js     # Test real notifications
├── test-injection.js             # Test command injection
├── test-complete-flow.sh         # End-to-end flow test
├── test-telegram-setup.sh        # Telegram setup test
│
├── Setup Scripts:
├── setup-telegram.sh             # Telegram automated setup
├── fix-telegram.sh               # Telegram troubleshooting
│
├── Configuration Files:
├── .env.example                  # Environment variable template
├── package.json                  # NPM dependencies and scripts
├── claude-hooks.json             # Claude Code hooks configuration
├── LICENSE                       # MIT License
└── README.md                     # Project documentation
```

## Key Components

### Notification Channels (`src/channels/`)
- Each platform has its own directory with channel implementation
- All channels extend `NotificationChannel` base class
- Channels handle both sending notifications and receiving commands

### Utilities (`src/utils/`)
- **tmux-monitor.js**: Monitor tmux sessions for Claude activity
- **controller-injector.js**: Inject commands into Claude sessions
- **trace-capture.js**: Capture terminal output for execution traces
- **subagent-tracker.js**: Track Claude subagent activities
- **conversation-tracker.js**: Track user-Claude conversations

### Relay System (`src/relay/`)
- PTY-based command relay for injecting commands
- Alternative to tmux-based injection

### Session Management (`src/data/sessions/`)
- JSON files for each active session
- Token-based authentication
- 24-hour expiration