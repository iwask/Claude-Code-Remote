#!/usr/bin/env node

/**
 * Test Discord Notification
 * Tests Discord bot connection and notification sending
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

const DiscordChannel = require('./src/channels/discord/discord');
const Logger = require('./src/core/logger');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
}

const logger = new Logger('Discord-Test');

// Configuration
const config = {
    botToken: process.env.DISCORD_BOT_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
    serverId: process.env.DISCORD_SERVER_ID
};

// Validate configuration
if (!config.botToken) {
    logger.error('DISCORD_BOT_TOKEN must be set in .env file');
    process.exit(1);
}

if (!config.channelId) {
    logger.error('DISCORD_CHANNEL_ID must be set in .env file');
    process.exit(1);
}

async function testDiscordNotification() {
    logger.info('🧪 Testing Discord notification...');
    logger.info(`Channel ID: ${config.channelId}`);

    const discordChannel = new DiscordChannel(config);

    // Test notification
    const testNotification = {
        type: 'completed',
        title: 'Discord Test Notification',
        message: 'This is a test notification from Claude Code Remote',
        project: 'test-project',
        metadata: {
            userQuestion: 'テスト質問: Discordの通知機能は正常に動作していますか？',
            claudeResponse: 'テスト応答: はい、Discord通知が正常に動作しています。この通知を受信できた場合、設定は成功です。',
            tmuxSession: 'test-session',
            workingDirectory: process.cwd(),
            timestamp: new Date().toISOString(),
            testMode: true
        }
    };

    try {
        logger.info('📤 Sending test notification...');
        const result = await discordChannel._sendImpl(testNotification);

        if (result) {
            logger.info('✅ Test notification sent successfully!');
            logger.info('📱 Please check your Discord channel');
            logger.info('💬 Try sending a command with the token shown in the notification');

            // Keep process alive for a few seconds to show bot status
            setTimeout(async () => {
                logger.info('Test complete. Disconnecting...');
                await discordChannel.disconnect();
                process.exit(0);
            }, 5000);
        } else {
            logger.error('❌ Failed to send test notification');
            logger.error('Please check:');
            logger.error('1. DISCORD_BOT_TOKEN is correct');
            logger.error('2. DISCORD_CHANNEL_ID is correct');
            logger.error('3. Bot has proper permissions in the channel');
            logger.error('4. MESSAGE CONTENT INTENT is enabled in Discord Developer Portal');
            await discordChannel.disconnect();
            process.exit(1);
        }
    } catch (error) {
        logger.error('❌ Error during test:', error.message);
        logger.error(error.stack);
        await discordChannel.disconnect();
        process.exit(1);
    }
}

// Run test
testDiscordNotification();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Test interrupted');
    process.exit(0);
});
