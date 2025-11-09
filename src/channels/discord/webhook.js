/**
 * Discord Webhook Handler
 * Handles incoming Discord messages and commands via webhooks
 */

const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const Logger = require('../../core/logger');
const ControllerInjector = require('../../utils/controller-injector');

class DiscordWebhookHandler {
    constructor(config = {}) {
        this.config = config;
        this.logger = new Logger('DiscordWebhook');
        this.sessionsDir = path.join(__dirname, '../../data/sessions');
        this.injector = new ControllerInjector();
        this.app = express();
        this.client = null;
        
        this._setupMiddleware();
        this._setupRoutes();
        this._initializeDiscordClient();
    }

    _setupMiddleware() {
        // Parse JSON for all routes
        this.app.use(express.json());
    }

    _setupRoutes() {
        // Discord webhook endpoint
        this.app.post('/webhook', this._handleWebhook.bind(this));
        
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', service: 'discord-webhook' });
        });
    }

    async _initializeDiscordClient() {
        try {
            this.client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent
                ]
            });

            await this.client.login(this.config.botToken);
            
            this.client.on('ready', () => {
                this.logger.info(`Discord webhook bot logged in as ${this.client.user.tag}`);
            });

            this.client.on('messageCreate', this._handleMessage.bind(this));

        } catch (error) {
            this.logger.error('Failed to initialize Discord webhook client:', error.message);
        }
    }

    async _handleWebhook(req, res) {
        try {
            const { type, data } = req.body;
            
            switch (type) {
                case 'message':
                    await this._handleMessageData(data);
                    break;
                default:
                    this.logger.warn('Unknown webhook type:', type);
            }
            
            res.status(200).send('OK');
        } catch (error) {
            this.logger.error('Webhook handling error:', error.message);
            res.status(500).send('Internal Server Error');
        }
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

        await this._processCommand(token, command, message);
    }

    async _handleMessageData(messageData) {
        // Handle webhook-based message processing
        const { content, author, channelId } = messageData;
        
        if (channelId !== this.config.channelId) return;

        const commandMatch = content.trim().match(/^([A-Z0-9]{8})\s+(.+)$/i);
        if (!commandMatch) return;

        const token = commandMatch[1].toUpperCase();
        const command = commandMatch[2];

        await this._processCommand(token, command, null);
    }

    async _processCommand(token, command, message) {
        try {
            // Find session by token
            const session = await this._findSessionByToken(token);
            if (!session) {
                if (message) {
                    await message.reply('❌ Token is invalid or has expired. Please wait for a new task notification.');
                }
                return;
            }

            // Check if session is expired
            if (session.expiresAt < Math.floor(Date.now() / 1000)) {
                if (message) {
                    await message.reply('❌ Token has expired. Please wait for a new task notification.');
                }
                await this._removeSession(session.id);
                return;
            }

            // Inject command into tmux session
            const tmuxSession = session.tmuxSession || 'default';
            await this.injector.injectCommand(command, tmuxSession);

            if (message) {
                // Send confirmation embed
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
            }

            this.logger.info(`Command injected via Discord webhook - Token: ${token}, Command: ${command}`);

        } catch (error) {
            this.logger.error('Discord webhook command injection failed:', error.message);
            if (message) {
                await message.reply(`❌ Command execution failed: ${error.message}`);
            }
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

    async start(port = 3002) {
        try {
            this.server = this.app.listen(port, () => {
                this.logger.info(`Discord webhook server started on port ${port}`);
            });
        } catch (error) {
            this.logger.error('Failed to start Discord webhook server:', error.message);
            throw error;
        }
    }

    async stop() {
        if (this.server) {
            this.server.close();
            this.logger.info('Discord webhook server stopped');
        }

        if (this.client) {
            this.client.destroy();
            this.logger.info('Discord webhook client disconnected');
        }
    }
}

module.exports = DiscordWebhookHandler;
