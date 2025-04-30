/**
 * Script untuk mendaftarkan hanya satu slash command sederhana
 * untuk mengidentifikasi masalah dengan Discord API
 */

const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv');
const { logger } = require('./utils/logger');

// Load environment variables
dotenv.config();

// Show information header
console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║  🛠️ Register Single Command - Troubleshooting    ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);

const clientId = process.env.CLIENT_ID || '1295357582553325640';
const guildId = process.env.GUILD_ID || '1297112621258113024';
const token = process.env.DISCORD_TOKEN;

// Check for token
if (!token) {
  console.error('🚫 DISCORD_TOKEN is missing!');
  process.exit(1);
}

// Create a single test command
const testCommand = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Responds with Pong!')
  .toJSON();

// Create REST instance
const rest = new REST({ version: '10' }).setToken(token);

// Register the command
async function registerCommand() {
  try {
    console.log(`🔍 Using the following configuration:
- clientId: ${clientId}
- guildId: ${guildId}
- token is ${token.length} characters long`);

    console.log('🔌 Connecting to Discord API...');
    
    // Register the command
    console.log('📝 Registering single command...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: [testCommand] }
    );
    
    console.log('✅ Command successfully registered!');
  } catch (error) {
    console.error('🚫 Error registering command:');
    console.error(`Error name: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      try {
        console.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      } catch (e) {
        console.error('Could not stringify response data');
      }
    }
  }
}

registerCommand();