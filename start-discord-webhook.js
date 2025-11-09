#!/usr/bin/env node

/**
 * Discord Webhook Server
 * Starts the Discord bot and webhook server for receiving messages
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Check if discord.js is installed
try {
    require('discord.js');
} catch (error) {
    console.error('❌ discord.js is not installed. Please run: npm install discord.js');
    process.exit(1);
}

const Logger = require('./src/core/logger');
const DiscordWebhookHandler = require('./src/channels/discord/webhook');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
}

const logger = new Logger('Discord-Webhook-Server');

// Load configuration
const config = {
    botToken: process.env.DISCORD_BOT_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
    serverId: process.env.DISCORD_SERVER_ID,
    port: process.env.DISCORD_WEBHOOK_PORT || 3002
};

// Validate configuration
if (!config.botToken) {
    logger.error('DISCORD_BOT_TOKEN must be set in .env file');
    logger.info('Please follow the setup guide:');
    logger.info('1. Create a Discord bot at https://discord.com/developers/applications');
    logger.info('2. Enable "MESSAGE CONTENT INTENT" in Bot settings');
    logger.info('3. Add bot to your server with proper permissions');
    logger.info('4. Copy bot token to DISCORD_BOT_TOKEN in .env');
    process.exit(1);
}

if (!config.channelId) {
    logger.error('DISCORD_CHANNEL_ID must be set in .env file');
    logger.info('To get channel ID:');
    logger.info('1. Enable Developer Mode in Discord (User Settings > Advanced)');
    logger.info('2. Right-click on the channel and select "Copy ID"');
    logger.info('3. Add the ID to DISCORD_CHANNEL_ID in .env');
    process.exit(1);
}

// Create and start webhook handler
const webhookHandler = new DiscordWebhookHandler(config);

async function start() {
    logger.info('Starting Discord webhook server...');
    logger.info(`Configuration:`);
    logger.info(`- Port: ${config.port}`);
    logger.info(`- Channel ID: ${config.channelId}`);
    logger.info(`- Server ID: ${config.serverId || 'Not set (optional)'}`);

    try {
        await webhookHandler.start(config.port);
        logger.info('✅ Discord webhook server started successfully');
        logger.info('The bot is now listening for messages and commands');
    } catch (error) {
        logger.error('Failed to start Discord webhook server:', error.message);
        process.exit(1);
    }
}

start();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down Discord webhook server...');
    await webhookHandler.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Shutting down Discord webhook server...');
    await webhookHandler.stop();
    process.exit(0);
});
