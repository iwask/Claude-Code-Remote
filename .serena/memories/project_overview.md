# Claude Code Remote - Project Overview

## Purpose
Claude Code Remote is a notification and remote control system for Claude Code that enables users to:
- Receive notifications when Claude Code completes tasks or needs input
- Send commands to Claude Code remotely from anywhere via multiple messaging platforms
- Monitor Claude's activities and responses in real-time

## Key Features
- **Multi-Platform Support**: Email (SMTP/IMAP), Telegram Bot, LINE messaging, Desktop notifications
- **Two-Way Communication**: Reply to notifications to send new commands to Claude
- **tmux/PTY Integration**: Seamless command injection into active Claude Code sessions
- **Smart Monitoring**: Intelligent detection of Claude responses with historical tracking
- **Session Management**: Token-based session handling with 24-hour expiration
- **Execution Trace**: Full terminal output capture in notifications
- **Group Support**: Team collaboration via Telegram and LINE groups

## Primary Use Cases
- Remote code reviews and development from any location
- Monitoring long-running Claude tasks
- Mobile development workflow (send commands from phone)
- Team collaboration with shared notifications

## Architecture
- Hook-based notification system (integrates with Claude Code hooks)
- Channel-based architecture for different notification platforms
- PTY/tmux injection for command execution
- Session-based token authentication for security