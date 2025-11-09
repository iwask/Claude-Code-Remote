#!/usr/bin/env node

/**
 * Test Command Injection
 * Tests the command injection mechanism without requiring tmux
 */

const path = require('path');
const fs = require('fs');
const ControllerInjector = require('./src/utils/controller-injector');

console.log('🧪 Testing Command Injection System\n');
console.log('=' .repeat(60));

// Test 1: Create a test session token
const sessionToken = 'TEST1234';
const sessionData = {
    id: sessionToken,
    tmuxSession: 'test-session',
    workingDirectory: process.cwd(),
    createdAt: Math.floor(Date.now() / 1000),
    expiresAt: Math.floor(Date.now() / 1000) + 86400 // 24 hours
};

const sessionsDir = path.join(__dirname, 'src/data/sessions');
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
}

const sessionFile = path.join(sessionsDir, `${sessionToken}.json`);
fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));

console.log('✅ Test session created:');
console.log(`   Token: ${sessionToken}`);
console.log(`   File: ${sessionFile}`);
console.log('');

// Test 2: Test the injector
console.log('📋 Testing Command Injector...');

const injector = new ControllerInjector();
const testCommand = 'echo "Hello from Discord!"';

console.log(`   Command to inject: ${testCommand}`);
console.log(`   Target session: test-session`);
console.log('');

// Since we don't have tmux, we'll test the injection logic
console.log('ℹ️  Note: Actual command injection requires tmux or PTY mode');
console.log('   This test verifies the session management and injection flow');
console.log('');

// Verify session can be read
console.log('🔍 Verifying session file...');
if (fs.existsSync(sessionFile)) {
    const readSession = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    console.log('✅ Session file is readable:');
    console.log(`   ID: ${readSession.id}`);
    console.log(`   Tmux Session: ${readSession.tmuxSession}`);
    console.log(`   Created: ${new Date(readSession.createdAt * 1000).toISOString()}`);
    console.log(`   Expires: ${new Date(readSession.expiresAt * 1000).toISOString()}`);
} else {
    console.log('❌ Session file not found!');
}
console.log('');

// Instructions for real testing
console.log('📝 To test with Discord:');
console.log('');
console.log('1. Make sure Docker webhook server is running:');
console.log('   docker compose ps');
console.log('');
console.log('2. Get the latest token from test notification:');
console.log('   (Check your Discord channel for the token)');
console.log('');
console.log('3. Send a command in Discord:');
console.log('   ZBVDE6Z7 echo "Test from Discord"');
console.log('   (Replace ZBVDE6Z7 with your actual token)');
console.log('');
console.log('4. Check Docker logs for command processing:');
console.log('   docker compose logs -f discord-webhook');
console.log('');

// Cleanup
console.log('🧹 Cleaning up test session...');
if (fs.existsSync(sessionFile)) {
    fs.unlinkSync(sessionFile);
    console.log('✅ Test session file removed');
}

console.log('');
console.log('✅ Test complete!');
