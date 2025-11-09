/**
 * Discord Notification Channel
 * Sends notifications via Discord Bot API with interactive command support
 */

const NotificationChannel = require('../base/channel');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const TmuxMonitor = require('../../utils/tmux-monitor');
const { execSync } = require('child_process');

class DiscordChannel extends NotificationChannel {
    constructor(config = {}) {
        super('discord', config);
        this.sessionsDir = path.join(__dirname, '../../data/sessions');
        this.tmuxMonitor = new TmuxMonitor();
        this.client = null;
        this.isConnected = false;
        
        this._ensureDirectories();
        this._validateConfig();
    }

    _ensureDirectories() {
        if (!fs.existsSync(this.sessionsDir)) {
            fs.mkdirSync(this.sessionsDir, { recursive: true });
        }
    }

    _validateConfig() {
        if (!this.config.botToken) {
            this.logger.warn('Discord Bot Token not found');
            return false;
        }
        if (!this.config.channelId) {
            this.logger.warn('Discord Channel ID must be configured');
            return false;
        }
        return true;
    }

    async _initializeClient() {
        if (this.client && this.isConnected) {
            this.logger.debug('Discord client already connected');
            return true;
        }

        // If client exists but not connected, destroy it first
        if (this.client && !this.isConnected) {
            this.logger.debug('Destroying existing disconnected client');
            this.client.destroy();
            this.client = null;
        }

        try {
            this.logger.info('Initializing Discord bot client...');
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent
                ]
            });

            // Set up event handlers before login
            this.client.on('messageCreate', this._handleMessage.bind(this));

            this.client.on('error', (error) => {
                this.logger.error('Discord client error:', error.message);
            });

            // Login to Discord
            this.logger.info('Logging in to Discord...');

            // Wait for ready state with proper promise handling
            const loginPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Discord client connection timeout (15s)'));
                }, 15000);

                this.client.once('ready', () => {
                    clearTimeout(timeout);
                    this.isConnected = true;
                    this.logger.info(`✅ Discord bot logged in as ${this.client.user.tag}`);
                    resolve();
                });

                this.client.once('error', (error) => {
                    clearTimeout(timeout);
                    this.logger.error('Discord client error during login:', error.message);
                    reject(error);
                });
            });

            // Actually perform login
            try {
                await this.client.login(this.config.botToken);
            } catch (loginError) {
                this.logger.error('Discord login failed:', loginError.message);
                if (loginError.code === 'TokenInvalid') {
                    this.logger.error('❌ Bot token is invalid. Please check DISCORD_BOT_TOKEN in .env');
                }
                throw loginError;
            }

            // Wait for ready event
            await loginPromise;

            return true;
        } catch (error) {
            this.logger.error('❌ Failed to initialize Discord client:', error.message);
            this.logger.error('Please check:');
            this.logger.error('1. DISCORD_BOT_TOKEN is valid');
            this.logger.error('2. Bot has proper permissions');
            this.logger.error('3. MESSAGE CONTENT INTENT is enabled');

            if (this.client) {
                this.client.destroy();
                this.client = null;
            }
            this.isConnected = false;
            return false;
        }
    }

    _generateToken() {
        // Generate short Token (uppercase letters + numbers, 8 digits)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let token = '';
        for (let i = 0; i < 8; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    _getCurrentTmuxSession() {
        try {
            // Try to get current tmux session
            const tmuxSession = execSync('tmux display-message -p "#S"', { 
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore']
            }).trim();
            
            return tmuxSession || null;
        } catch (error) {
            // Not in a tmux session or tmux not available
            return null;
        }
    }

    async _sendImpl(notification) {
        try {
            this.logger.info('📤 Attempting to send Discord notification...');
            this.logger.debug(`Notification type: ${notification.type}, Project: ${notification.project}`);

            if (!await this._initializeClient()) {
                this.logger.error('❌ Failed to initialize Discord client');
                return false;
            }

            this.logger.info(`🔍 Fetching Discord channel: ${this.config.channelId}`);
            const channel = await this.client.channels.fetch(this.config.channelId);
            if (!channel) {
                this.logger.error(`❌ Discord channel not found: ${this.config.channelId}`);
                this.logger.error('Please check:');
                this.logger.error('1. Channel ID is correct');
                this.logger.error('2. Bot has access to the channel');
                this.logger.error('3. Bot is in the same server as the channel');
                return false;
            }

            this.logger.info(`✅ Channel found: ${channel.name || channel.id}`);

            // Generate token for interactive responses
            const token = this._generateToken();
            const tmuxSession = this._getCurrentTmuxSession() || 'default';

            this.logger.info(`🎫 Generated token: ${token}, Tmux session: ${tmuxSession}`);

            // Store session for later command handling
            await this._storeSession(token, notification, tmuxSession);

            // Create rich embed
            const embed = new EmbedBuilder()
                .setTitle(notification.title || 'Claude Code Notification')
                .setDescription(notification.message || 'Claude has completed a task')
                .setColor(notification.type === 'completed' ? 0x00ff00 : 0xffff00)
                .addFields(
                    { name: 'Project', value: notification.project || 'Unknown', inline: true },
                    { name: 'Type', value: notification.type || 'unknown', inline: true },
                    { name: 'Session Token', value: `\`${token}\``, inline: true }
                )
                .setTimestamp();

            // Add metadata if available
            if (notification.metadata) {
                if (notification.metadata.userQuestion) {
                    embed.addFields({
                        name: 'Your Question',
                        value: notification.metadata.userQuestion.substring(0, 1024),
                        inline: false
                    });
                }

                if (notification.metadata.claudeResponse) {
                    embed.addFields({
                        name: "Claude's Response",
                        value: notification.metadata.claudeResponse.substring(0, 1024),
                        inline: false
                    });
                }
            }

            // Add interactive instructions
            embed.addFields({
                name: '💬 Send New Command',
                value: `Reply with: \`${token} <your command>\`\nExample: \`${token} Please analyze this code file\``,
                inline: false
            });

            this.logger.info('📨 Sending embed message to Discord...');
            const message = await channel.send({ embeds: [embed] });
            this.logger.info(`✅ Discord notification sent successfully! Message ID: ${message.id}`);
            this.logger.info(`🎫 Session token: ${token}`);

            return true;
        } catch (error) {
            this.logger.error('❌ Failed to send Discord notification:', error.message);
            this.logger.error('Error details:', error.stack);
            return false;
        }
    }

    async _storeSession(token, notification, tmuxSession) {
        const sessionFile = path.join(this.sessionsDir, `${token}.json`);
        const sessionData = {
            id: token,
            notification,
            tmuxSession,
            createdAt: Math.floor(Date.now() / 1000),
            expiresAt: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
            type: 'discord'
        };

        fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    }

    async _handleMessage(message) {
        // Ignore bot messages
        if (message.author.bot) return;

        // Only process messages in the configured channel
        if (message.channelId !== this.config.channelId) return;

        const content = message.content.trim();
        
        // Parse token command format: <TOKEN> <command>
        const commandMatch = content.match(/^([A-Z0-9]{8})\s+(.+)$/i);
        if (!commandMatch) return;

        const token = commandMatch[1].toUpperCase();
        const command = commandMatch[2];

        try {
            // Find session by token
            const session = await this._findSessionByToken(token);
            if (!session) {
                await message.reply('❌ Token is invalid or has expired. Please wait for a new task notification.');
                return;
            }

            // Check if session is expired
            if (session.expiresAt < Math.floor(Date.now() / 1000)) {
                await message.reply('❌ Token has expired. Please wait for a new task notification.');
                await this._removeSession(session.id);
                return;
            }

            // Inject command into tmux session
            const tmuxSession = session.tmuxSession || 'default';
            const ControllerInjector = require('../../utils/controller-injector');
            const injector = new ControllerInjector();
            await injector.injectCommand(command, tmuxSession);

            // Send confirmation
            const confirmEmbed = new EmbedBuilder()
                .setTitle('✅ Command Sent')
                .setColor(0x00ff00)
                .addFields(
                    { name: 'Command', value: command, inline: false },
                    { name: 'Session', value: tmuxSession, inline: true }
                )
                .setDescription('Please wait, Claude is processing your request...')
                .setTimestamp();

            await message.reply({ embeds: [confirmEmbed] });

            this.logger.info(`Command injected via Discord - User: ${message.author.tag}, Token: ${token}, Command: ${command}`);

        } catch (error) {
            this.logger.error('Discord command injection failed:', error.message);
            await message.reply(`❌ Command execution failed: ${error.message}`);
        }
    }

    async _findSessionByToken(token) {
        const sessionFile = path.join(this.sessionsDir, `${token}.json`);
        
        if (!fs.existsSync(sessionFile)) {
            return null;
        }

        try {
            const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
            return sessionData;
        } catch (error) {
            this.logger.error('Failed to read session file:', error.message);
            return null;
        }
    }

    async _removeSession(token) {
        const sessionFile = path.join(this.sessionsDir, `${token}.json`);
        
        if (fs.existsSync(sessionFile)) {
            try {
                fs.unlinkSync(sessionFile);
            } catch (error) {
                this.logger.error('Failed to remove session file:', error.message);
            }
        }
    }

    supportsRelay() {
        return true;
    }

    async test() {
        try {
            if (!await this._initializeClient()) {
                return false;
            }

            const channel = await this.client.channels.fetch(this.config.channelId);
            if (!channel) {
                this.logger.error('Discord channel not found');
                return false;
            }

            const testEmbed = new EmbedBuilder()
                .setTitle('🧪 Claude-Code-Remote Test')
                .setColor(0x0099ff)
                .setDescription('Test notification from Discord channel')
                .addFields(
                    { name: 'Status', value: '✅ Working correctly', inline: true },
                    { name: 'Channel', value: this.name, inline: true }
                )
                .setTimestamp();

            await channel.send({ embeds: [testEmbed] });
            this.logger.info('Discord test notification sent successfully');
            
            return true;
        } catch (error) {
            this.logger.error('Discord test failed:', error.message);
            return false;
        }
    }

    async disconnect() {
        if (this.client) {
            this.client.destroy();
            this.isConnected = false;
            this.logger.info('Discord client disconnected');
        }
    }

    getStatus() {
        const baseStatus = super.getStatus();
        return {
            ...baseStatus,
            connected: this.isConnected,
            channelId: this.config.channelId
        };
    }
}

module.exports = DiscordChannel;
