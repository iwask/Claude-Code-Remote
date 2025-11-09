# Code Style and Conventions

## Module System
- **CommonJS**: Use `require()` and `module.exports`
- No ES6 modules (`import/export`)

## Code Organization
- **Class-based architecture**: Notification channels extend `NotificationChannel` base class
- **Separation of concerns**: Channels, utilities, core logic, and relay components are separated
- **Factory pattern**: Channel creation and management

## Documentation
- **JSDoc comments**: Document classes, methods, and complex functions
- **Inline comments**: Explain complex logic and business rules
- **Multi-language**: Some comments in Chinese, but code and primary docs in English

## Naming Conventions
- **camelCase**: Variables and functions (e.g., `sendHookNotification`, `tmuxSession`)
- **PascalCase**: Classes (e.g., `TelegramChannel`, `ControllerInjector`)
- **UPPER_SNAKE_CASE**: Constants and environment variables (e.g., `SESSION_MAP_PATH`, `TELEGRAM_BOT_TOKEN`)
- **Private methods**: Prefix with underscore (e.g., `_validateConfig()`, `_sendImpl()`)

## Async Patterns
- **async/await**: Preferred for asynchronous operations
- **Promises**: Used where appropriate
- **Error handling**: try-catch blocks with logger.error()

## Logging
- **pino logger**: Used throughout the application
- **Log levels**: debug, info, warn, error
- **Structured logging**: Include context (sessionId, token, etc.)

## Configuration
- **Environment variables**: Primary configuration method via `.env`
- **JSON configs**: For structured data in `config/` directory
- **Validation**: Config validation in constructors and initialization

## Error Handling
- Graceful degradation for missing dependencies
- Clear error messages with context
- Cleanup of resources on failure (e.g., remove failed sessions)

## File Operations
- Use `fs.existsSync()` before file operations
- Create directories recursively when needed
- Handle file not found errors gracefully