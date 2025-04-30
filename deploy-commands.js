/**
 * Deploy Commands Script
 * 
 * Script untuk mendaftarkan slash commands ke Discord API.
 * Jalankan script ini setiap kali ada perubahan pada commands.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { logger } = require('./utils/logger');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get clientId and guildId from environment or fallback to config
// Environment variables take precedence over config
let clientId, guildId;
try {
  // Try to import config
  const config = require('./config');
  // Use config values as fallback
  clientId = process.env.CLIENT_ID || config.clientId || '1352565363698700348';
  guildId = process.env.GUILD_ID || config.guildId || '1297112621258113024';
} catch (error) {
  // If config import fails, use environment variables or hardcoded defaults
  logger.warn('Could not import config.js, using environment variables or defaults');
  clientId = process.env.CLIENT_ID || '1352565363698700348';
  guildId = process.env.GUILD_ID || '1297112621258113024';
}

// Display command registration header
console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║       🎭 Nararya Bot Command Registration        ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`);

// Validate required variables
if (!process.env.DISCORD_TOKEN) {
  logger.error('🚫 DISCORD_TOKEN is missing! Check your .env file or environment variables.');
  process.exit(1);
}

if (!clientId || !guildId) {
  logger.error(`🚫 Missing required configuration:
  - clientId: ${clientId ? 'OK' : 'MISSING'}
  - guildId: ${guildId ? 'OK' : 'MISSING'}`);
  logger.error('Check config.js to ensure these values are properly set.');
  process.exit(1);
}

// Log configuration
logger.info(`Using configuration:
- clientId: ${clientId}
- guildId: ${guildId}`);

const commands = [];

// Ambil semua perintah (commands) dari direktori commands
function getAllCommands() {
  logger.info('Collecting all commands from directories...');
  const commandsCollected = [];
  
  // Gather all command files from the commands directory
  const foldersPath = path.join(__dirname, 'commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    
    // Skip if not a directory
    if (!fs.lstatSync(commandsPath).isDirectory()) continue;
    
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      
      try {
        // Force refresh module cache to get the latest version
        delete require.cache[require.resolve(filePath)];
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
          // Add the command data to the array
          commandsCollected.push(command.data.toJSON());
          logger.info(`Added command: ${command.data.name}`);
        } else {
          logger.warn(`The command at ${filePath} is missing required "data" or "execute" property.`);
        }
      } catch (error) {
        logger.error(`Error loading command at ${filePath}:`, error);
      }
    }
  }
  
  return commandsCollected;
}

// Periksa duplikat commands dan command yang tidak valid
function checkDuplicateCommands(commandList) {
  const commandNames = {};
  const validCommands = [];
  
  for (const cmd of commandList) {
    if (!cmd.name) {
      logger.warn(`Skipping command with no name property`);
      continue;
    }
    
    if (commandNames[cmd.name]) {
      logger.warn(`Duplicate command name detected: ${cmd.name}. Skipping duplicate.`);
    } else {
      commandNames[cmd.name] = true;
      validCommands.push(cmd);
    }
  }
  
  return validCommands;
}

// Deploy commands
async function deployCommands() {
  try {
    // Get all commands
    const allCommands = getAllCommands();
    
    if (allCommands.length === 0) {
      logger.error('No commands found! Check command folders and files.');
      return;
    }
    
    // Check for duplicates
    const validCommands = checkDuplicateCommands(allCommands);
    
    logger.info(`Started refreshing ${validCommands.length} application (/) commands.`);
    
    // Get token from environment
    const token = process.env.DISCORD_TOKEN;
    
    // Validate Discord token again
    if (!token || token.trim() === '') {
      logger.error('🚫 DISCORD_TOKEN not found in environment variables!');
      logger.info('💡 Please set the DISCORD_TOKEN in .env file or Replit Secrets');
      return;
    }
    
    // Validate client ID and guild ID
    if (!clientId || !guildId) {
      logger.error(`🚫 Client ID or Guild ID not properly configured in config.js!`);
      logger.error(`Current values - clientId: ${clientId}, guildId: ${guildId}`);
      return;
    }
    
    // Create and configure REST instance with extended timeout (600 seconds = 10 menit)
    const rest = new REST({ version: '10', timeout: 600000 })
      .setToken(token);
    
    // Log command details for validation
    logger.info('Validating commands before deployment:');
    validCommands.forEach(cmd => {
      logger.info(`- ${cmd.name}: ${cmd.description}`);
    });
    
    // First, get existing commands to compare
    logger.info('Fetching existing commands...');
    const existingCommands = await rest.get(
      Routes.applicationGuildCommands(clientId, guildId)
    ).catch(error => {
      logger.error('Error fetching existing commands:', error);
      return [];
    });
    
    logger.info(`Found ${existingCommands.length} existing commands.`);
    
    // Deploy commands to the specified guild (server) dengan mekanisme retry
    logger.info('Deploying commands to Discord API...');
    let data;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        data = await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: validCommands },
        );
        
        // Jika berhasil, keluar dari loop
        break;
      } catch (putError) {
        retryCount++;
        logger.warn(`Command deployment attempt ${retryCount} failed: ${putError.message}`);
        
        if (retryCount >= maxRetries) {
          throw putError; // Re-throw setelah semua retry gagal
        }
        
        // Tunggu sebelum mencoba lagi (backoff eksponensial)
        const waitTime = 5000 * Math.pow(2, retryCount);
        logger.info(`Retrying in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    logger.info(`Successfully reloaded ${data.length} application (/) commands to guild ${guildId}.`);
    
    // Verify registration by comparing command lists
    const addedCommands = validCommands.filter(cmd => 
      !existingCommands.some(existing => existing.name === cmd.name)
    );
    
    const removedCommands = existingCommands.filter(existing => 
      !validCommands.some(cmd => cmd.name === existing.name)
    );
    
    const updatedCommands = validCommands.filter(cmd => 
      existingCommands.some(existing => existing.name === cmd.name)
    );
    
    logger.info(`Added ${addedCommands.length} new commands.`);
    if (addedCommands.length > 0) {
      addedCommands.forEach(cmd => logger.info(`- Added: ${cmd.name}`));
    }
    
    logger.info(`Removed ${removedCommands.length} old commands.`);
    if (removedCommands.length > 0) {
      removedCommands.forEach(cmd => logger.info(`- Removed: ${cmd.name}`));
    }
    
    logger.info(`Updated ${updatedCommands.length} existing commands.`);
    
    // Tunda penutupan process untuk memastikan semua log telah ditulis
    setTimeout(() => {
      logger.info('Command registration complete');
      logger.info('Bot commands are now available in Discord server!');
    }, 5000);
    
  } catch (error) {
    logger.error('🚫 Error deploying commands:');
    logger.error(JSON.stringify(error, null, 2));
    
    // Inspect error object in detail
    logger.error('Error name: ' + error.name);
    logger.error('Error message: ' + error.message);
    logger.error('Error stack: ' + error.stack);
    
    // Menambahkan detail error
    if (error.code) {
      logger.error(`Error code: ${error.code}`);
      
      if (error.code === 50001) {
        logger.error('Bot lacks permissions to create commands. Check bot permissions in Discord Developer Portal.');
      } else if (error.code === 50013) {
        logger.error('Missing Permissions. Bot needs "applications.commands" scope.');
      } else if (error.code === 429) {
        logger.error('Rate limited by Discord API. Wait before trying again.');
      }
    }
    
    // Check for specific error details
    if (error.method) logger.error('Request method: ' + error.method);
    if (error.path) logger.error('Request path: ' + error.path);
    if (error.requestBody) logger.error('Request body: ' + JSON.stringify(error.requestBody));
    
    if (error.response) {
      logger.error(`Response status: ${error.response.status}`);
      logger.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    // Log token validity (without showing the actual token)
    if (process.env.DISCORD_TOKEN) {
      const tokenLength = process.env.DISCORD_TOKEN.length;
      logger.info(`Token is ${tokenLength} characters long`);
      logger.info(`Token format valid: ${/^[A-Za-z0-9._-]+$/.test(process.env.DISCORD_TOKEN)}`);
    }
    
    // Suggestions to fix
    logger.info('🔍 Suggestions to fix command deployment issues:');
    logger.info('1. Check your Discord token is valid and not expired');
    logger.info('2. Verify the client ID and guild ID in config.js');
    logger.info('3. Make sure the bot has appropriate permissions in the server');
    logger.info('4. Check that command formats are valid (name, description, etc.)');
    logger.info('5. Ensure the bot application has the "applications.commands" scope enabled');
  }
}

// Panggil fungsi utama
deployCommands();