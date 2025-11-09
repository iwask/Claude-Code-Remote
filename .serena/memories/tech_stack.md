# Technology Stack

## Runtime & Language
- **Node.js**: >= 14.0.0
- **Language**: JavaScript (CommonJS modules)
- **Platforms**: macOS (darwin), Linux, Windows (win32)

## Core Dependencies
- **express**: Web server for webhooks
- **axios**: HTTP client for API requests
- **dotenv**: Environment variable management
- **node-pty**: PTY (pseudo-terminal) for command injection
- **execa**: Enhanced child process execution

## Messaging Platforms
- **Telegram Bot API**: Interactive bot with buttons and commands
- **LINE Messaging API**: Token-based messaging
- **SMTP/IMAP**: Email notifications and command reception
- **Desktop Notifications**: System-level notifications with sound

## Utilities
- **pino**: High-performance logging with pretty-printing
- **uuid**: Session ID generation
- **imapflow/node-imap**: Email retrieval
- **nodemailer**: Email sending
- **mailparser**: Email parsing

## External Tools
- **tmux**: Required for command injection (session management)
- **Claude Code CLI**: The main AI assistant being controlled

## Configuration
- Environment variables via `.env` file
- JSON configuration files in `config/` directory
- Session data stored in `src/data/sessions/`