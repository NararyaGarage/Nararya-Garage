/**
 * 🎭 Nararya Garage Discord Bot - Main Entry Point
 * 
 * Bot Discord komprehensif untuk komunitas JKT48, dengan notifikasi real-time,
 * tracking member, moderasi server, dan fitur ekonomi.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

// Import required modules
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { logger } = require('./utils/logger');

// Load environment variables before importing config
const envResult = dotenv.config();
if (envResult.error) {
  logger.warn('No .env file found. Using environment variables or defaults.');
}

// Import config after loading environment variables
// This allows process.env values to be used in config.js
const config = require('./config');

// Use environment variables for CLIENT_ID and GUILD_ID if available
// This ensures consistency with deploy-commands.js
const clientId = process.env.CLIENT_ID || config.clientId;
const guildId = process.env.GUILD_ID || config.guildId;

// Removing duplicate environment loading
// The env variables are already loaded at the top of the file

// Check for required environment variables
if (!process.env.DISCORD_TOKEN) {
  logger.error('🚫 DISCORD_TOKEN is not set in environment variables!');
  logger.info('💡 Please create a .env file based on .env.example with your Discord token');
  process.exit(1);
}

// Validate configuration
if (!clientId || !guildId) {
  logger.error('🚫 clientId or guildId not properly configured!');
  logger.error(`Current values - clientId: ${clientId}, guildId: ${guildId}`);
  process.exit(1);
}

// Display startup header
console.log(`
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║   🎭 Nararya Garage Bot v${config.botInfo.version}                 ║
  ║   © 2025 Nararya Garage Team                     ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
`);

// Save PID to file for keep-alive script
const pidFilePath = path.join(__dirname, 'bot.pid');
fs.writeFileSync(pidFilePath, process.pid.toString());

// Report Node.js version
logger.info(`Node.js version: ${process.version}`);
logger.info(`Discord.js version: ${require('discord.js').version}`);

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ]
});

// Initialize collections for commands
client.commands = new Collection();
client.cooldowns = new Collection();

// Load all event handlers
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Import command wrapper utility
const { wrapCommandExecute } = require('./utils/commandWrapper');

// Load all command handlers
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));

for (const folder of commandFolders) {
  const commandsPath = path.join(__dirname, 'commands', folder);
  if (!fs.lstatSync(commandsPath).isDirectory()) continue;
  
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      // Wrap the execute function with error handling and auto-deferreply
      const safeCommand = {
        ...command,
        execute: wrapCommandExecute(command.execute)
      };
      client.commands.set(command.data.name, safeCommand);
      logger.debug(`Loaded and wrapped command: ${command.data.name}`);
    } else {
      logger.warn(`Command at ${filePath} is missing required "data" or "execute" property.`);
    }
  }
}

// Import and setup services
const { setupYoutubeMonitoring } = require('./services/youtubeRealtimeService');
const { setupTwitterMonitoring } = require('./services/twitterService');
const { setupInstagramMonitoring } = require('./services/instagramService');
const { startStatusRotation } = require('./utils/statusRotation');
const { setupScheduledTasks } = require('./utils/scheduledTasks');

// Import holiday notifications system
let holidayNotifications;
try {
  holidayNotifications = require('./utils/holidayNotifications');
} catch (e) {
  logger.warn('Holiday notifications module not found or has errors:', e.message);
  holidayNotifications = { setupHolidayNotifications: () => {} };
}

// Setup services after bot is ready
client.once('ready', () => {
  // Log bot initialization
  logger.info(`Bot logged in as ${client.user.tag}`);
  
  // Log connected servers
  logger.info(`Serving ${client.guilds.cache.size} guild(s)`);
  client.guilds.cache.forEach(guild => {
    logger.info(`Connected to guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
  });
  
  // Ensure data directory exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  try {
    // Setup status rotation
    logger.info('Rotating status with JKT48 members');
    startStatusRotation(client);
    
    // Setup social media monitoring
    logger.info('Setting up YouTube realtime monitoring...');
    setupYoutubeMonitoring(client);
    
    logger.info('Twitter monitoring service started');
    setupTwitterMonitoring(client);
    
    logger.info('Instagram monitoring service started');
    setupInstagramMonitoring(client);
    
    // Setup scheduled tasks (reminders, etc.)
    logger.info('Setting up scheduled tasks...');
    setupScheduledTasks(client);
    
    // Setup holiday notifications
    try {
      logger.info('Setting up holiday notifications...');
      holidayNotifications.setupHolidayNotifications(client);
    } catch (error) {
      logger.error('Error setting up holiday notifications:', error);
    }
    
    logger.info('Scheduled tasks setup complete');
  } catch (error) {
    logger.error('Error during service initialization:', error);
  }
  
  logger.info('Bot has logged in successfully');
});

// Process handling for graceful shutdown
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  logger.info('Bot is shutting down...');
  
  try {
    // Cleanup PID file
    if (fs.existsSync(pidFilePath)) {
      fs.unlinkSync(pidFilePath);
    }
  } catch (error) {
    logger.error('Error during cleanup:', error);
  }
  
  client.destroy();
  process.exit(0);
}

// Express server for health checks (separate from the keep-alive.js server)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Express server listening at http://0.0.0.0:${PORT}`);
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
  .catch(error => {
    logger.error('Failed to login:', error);
    process.exit(1);
  });