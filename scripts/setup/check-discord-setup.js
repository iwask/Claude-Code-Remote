#!/usr/bin/env node

/**
 * Discord Setup Checker
 * Diagnoses Discord bot configuration issues
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { Client, GatewayIntentBits } = require('discord.js');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
}

console.log('🔍 Discord Bot Setup Checker\n');
console.log('=' .repeat(60));

// Check configuration
const config = {
    botToken: process.env.DISCORD_BOT_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
    serverId: process.env.DISCORD_SERVER_ID
};

console.log('📋 Configuration Check:');
console.log(`✓ Bot Token: ${config.botToken ? '✅ Set' : '❌ Missing'}`);
console.log(`✓ Channel ID: ${config.channelId ? '✅ ' + config.channelId : '❌ Missing'}`);
console.log(`✓ Server ID: ${config.serverId ? '✅ ' + config.serverId : '⚠️  Not set (optional)'}`);
console.log('');

if (!config.botToken) {
    console.error('❌ DISCORD_BOT_TOKEN is required in .env file');
    process.exit(1);
}

if (!config.channelId) {
    console.error('❌ DISCORD_CHANNEL_ID is required in .env file');
    process.exit(1);
}

async function diagnose() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    try {
        console.log('🔐 Logging in to Discord...');

        // Set up ready handler before login
        const readyPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Login timeout after 15 seconds'));
            }, 15000);

            client.once('ready', () => {
                clearTimeout(timeout);
                console.log(`✅ Bot logged in as: ${client.user.tag}`);
                console.log('');
                resolve();
            });

            client.once('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });

        await client.login(config.botToken);
        await readyPromise;

        console.log('📊 Bot Information:');
        console.log(`  Bot ID: ${client.user.id}`);
        console.log(`  Bot Username: ${client.user.username}`);
        console.log('');

        // List all guilds (servers) the bot is in
        console.log('🏰 Servers Bot is in:');
        if (client.guilds.cache.size === 0) {
            console.log('  ❌ Bot is not in any servers!');
            console.log('  Please invite the bot to your server:');
            console.log(`  https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=277025508352&scope=bot`);
            client.destroy();
            process.exit(1);
        }

        client.guilds.cache.forEach((guild) => {
            console.log(`  ✅ ${guild.name} (ID: ${guild.id})`);
        });
        console.log('');

        // Try to fetch the specified channel
        console.log(`🔍 Checking Channel: ${config.channelId}`);
        try {
            const channel = await client.channels.fetch(config.channelId);

            if (channel) {
                console.log(`  ✅ Channel found: #${channel.name || channel.id}`);
                console.log(`  Type: ${channel.type}`);
                console.log(`  Server: ${channel.guild ? channel.guild.name : 'DM/Unknown'}`);

                // Check permissions
                if (channel.guild) {
                    const permissions = channel.permissionsFor(client.user);
                    console.log('');
                    console.log('🔑 Bot Permissions in this channel:');
                    console.log(`  View Channel: ${permissions.has('ViewChannel') ? '✅' : '❌'}`);
                    console.log(`  Send Messages: ${permissions.has('SendMessages') ? '✅' : '❌'}`);
                    console.log(`  Read Message History: ${permissions.has('ReadMessageHistory') ? '✅' : '❌'}`);
                    console.log(`  Embed Links: ${permissions.has('EmbedLinks') ? '✅' : '❌'}`);

                    const missingPerms = [];
                    if (!permissions.has('ViewChannel')) missingPerms.push('ViewChannel');
                    if (!permissions.has('SendMessages')) missingPerms.push('SendMessages');
                    if (!permissions.has('ReadMessageHistory')) missingPerms.push('ReadMessageHistory');
                    if (!permissions.has('EmbedLinks')) missingPerms.push('EmbedLinks');

                    if (missingPerms.length > 0) {
                        console.log('');
                        console.log(`❌ Missing required permissions: ${missingPerms.join(', ')}`);
                        console.log('');
                        console.log('To fix:');
                        console.log('1. Go to your Discord server');
                        console.log(`2. Right-click on #${channel.name}`);
                        console.log('3. Select "Edit Channel" > "Permissions"');
                        console.log(`4. Add the bot "${client.user.username}" as a member`);
                        console.log('5. Grant the following permissions:');
                        missingPerms.forEach(perm => console.log(`   - ${perm}`));
                    } else {
                        console.log('');
                        console.log('✅ All required permissions are granted!');
                        console.log('');
                        console.log('🎉 Discord bot is properly configured!');
                        console.log('You can now use the notification system.');
                    }
                }
            } else {
                console.log('  ❌ Channel not found');
            }
        } catch (channelError) {
            console.log(`  ❌ Error fetching channel: ${channelError.message}`);

            if (channelError.code === 50001) {
                console.log('');
                console.log('❌ Missing Access Error');
                console.log('This usually means:');
                console.log('1. The bot is not in the server where this channel exists');
                console.log('2. The bot doesn\'t have permission to view this channel');
                console.log('3. The channel ID is incorrect');
                console.log('');
                console.log('Solutions:');
                console.log('1. Verify the DISCORD_CHANNEL_ID in .env is correct');
                console.log('   - Enable Developer Mode in Discord (User Settings > Advanced)');
                console.log('   - Right-click the channel and select "Copy ID"');
                console.log('');
                console.log('2. Ensure the bot is in the same server as the channel:');
                console.log(`   https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=277025508352&scope=bot`);
                console.log('');
                console.log('3. Grant the bot "View Channel" and "Send Messages" permissions');
                console.log('   in the channel settings');
            }
        }

        client.destroy();
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'TokenInvalid') {
            console.error('The bot token is invalid. Please check DISCORD_BOT_TOKEN in .env');
        }
        process.exit(1);
    }
}

diagnose();
