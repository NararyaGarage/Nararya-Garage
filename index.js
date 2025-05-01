/**
 * Nararya Garage Discord Bot
 * 
 * Bot Discord terlengkap untuk komunitas JKT48 & 48Group.
 * Fitur: Notifikasi, statistik, game, moderasi, dan banyak lagi.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

// Import dependencies
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection, Events, REST, Routes, ActivityType } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const moment = require('moment-timezone');
const express = require('express');
const { exec } = require('child_process');

// Set Moment timezone to Asia/Jakarta
moment.tz.setDefault('Asia/Jakarta');

// Configuration
const config = require('./config.js');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

// Collections for commands and other data
client.commands = new Collection();
client.cooldowns = new Collection();
client.statusMessages = [];
client.currentlyLive = new Map();
client.userGameData = new Map();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, folder, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`Loaded command: ${command.data.name}`);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  
  console.log(`Loaded event: ${event.name}`);
}

// Status rotation system
async function loadStatusMessages() {
  client.statusMessages = [
    { text: "JKT48 High Tension MV", type: ActivityType.Watching },
    { text: "JKT48 songs", type: ActivityType.Listening },
    { text: "with JKT48 fans", type: ActivityType.Playing },
    { text: "JKT48 news updates", type: ActivityType.Watching },
    { text: "JKT48 Theater Shows", type: ActivityType.Watching },
    { text: "Hanya Lihat Padamu", type: ActivityType.Listening },
    { text: "Rapsodi", type: ActivityType.Listening },
    { text: "Fortune Cookie", type: ActivityType.Listening },
    { text: "/help for commands", type: ActivityType.Playing },
    { text: "Kimi wa Melody", type: ActivityType.Listening }
  ];
}

// Rotate status every 30 seconds
function startStatusRotation() {
  setInterval(() => {
    if (client.statusMessages.length > 0) {
      const randomStatus = client.statusMessages[Math.floor(Math.random() * client.statusMessages.length)];
      client.user.setActivity(randomStatus.text, { type: randomStatus.type });
      
      // Log status change (optional, can be removed in production)
      console.log(`Status updated to: ${randomStatus.type} ${randomStatus.text}`);
    }
  }, 30000); // 30 seconds
}

// Web server for uptime monitoring
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Nararya Garage Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// Handle process shutdown
process.on('SIGINT', () => {
  console.log('Bot shutting down...');
  process.exit();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Login to Discord with the token
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log(`Logged in as ${client.user.tag}!`);
    loadStatusMessages().then(() => {
      startStatusRotation();
    });
  })
  .catch(error => {
    console.error('Error logging in:', error);
  });

// Save bot process ID to file for uptime service
fs.writeFileSync('bot.pid', process.pid.toString());