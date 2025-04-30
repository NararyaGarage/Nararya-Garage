/**
 * UptimeRobot Keep-Alive Server
 * 
 * This file creates a separate Express server specifically for UptimeRobot to ping.
 * Running this as a separate process ensures the bot stays online even if the main bot process crashes.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { logger } = require('./utils/logger');

// Port configuration
const PORT = process.env.PORT || 3001;

// Create Express app
const app = express();

// Status variables
let lastPing = Date.now();
let botStatus = 'unknown';

// Bot process monitoring
let botProcessId = null;
let botStartTime = null;

// Path to the process ID file
const pidFilePath = path.join(__dirname, 'bot.pid');

// Simple homepage
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Nararya Garage Bot - UptimeRobot Monitor</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; color: #333; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          h1 { color: #7289DA; }
          .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
          .online { background: #43B581; color: white; }
          .offline { background: #F04747; color: white; }
          .unknown { background: #FAA61A; color: white; }
          .info { background: #eee; padding: 10px; border-radius: 4px; margin: 10px 0; }
          footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Nararya Garage Bot</h1>
          <div class="status ${botStatus === 'online' ? 'online' : botStatus === 'offline' ? 'offline' : 'unknown'}">
            Bot Status: ${botStatus.toUpperCase()}
          </div>
          <div class="info">
            <p><strong>Last Ping:</strong> ${new Date(lastPing).toLocaleString()}</p>
            <p><strong>Bot Start Time:</strong> ${botStartTime ? new Date(botStartTime).toLocaleString() : 'N/A'}</p>
            <p><strong>Bot Process ID:</strong> ${botProcessId || 'N/A'}</p>
            <p><strong>Uptime:</strong> ${botStartTime ? formatUptime(Date.now() - botStartTime) : 'N/A'}</p>
          </div>
          <p>This page is used by UptimeRobot to keep the bot online 24/7.</p>
        </div>
        <footer>&copy; 2025 Nararya Garage Team - All Rights Reserved</footer>
      </body>
    </html>
  `);
});

// Keep-alive endpoint for UptimeRobot
app.get('/keep-alive', (req, res) => {
  lastPing = Date.now();
  
  // Check bot status
  checkBotStatus();
  
  // Return status
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    botStatus
  });
});

// Route to restart the bot
app.get('/restart', (req, res) => {
  // Simple "authentication" with a query param
  const secret = req.query.secret;
  
  if (secret !== process.env.RESTART_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  restartMainBot();
  
  res.json({
    status: 'ok',
    message: 'Bot restart initiated',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`UptimeRobot keep-alive server running at http://0.0.0.0:${PORT}`);
  console.log(`Set UptimeRobot to monitor: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/keep-alive`);
  
  // Start the bot if it's not already running
  if (!isMainBotRunning()) {
    restartMainBot();
  }
});

/**
 * Check if the main bot is running
 * @returns {boolean} Whether the main bot is running
 */
function isMainBotRunning() {
  try {
    // Check if PID file exists
    if (fs.existsSync(pidFilePath)) {
      const pid = fs.readFileSync(pidFilePath, 'utf8').trim();
      botProcessId = pid;
      
      // Check if process is actually running
      try {
        process.kill(pid, 0); // Doesn't actually kill the process, just checks if it exists
        botStatus = 'online';
        return true;
      } catch (e) {
        // Process doesn't exist
        botStatus = 'offline';
        return false;
      }
    }
    
    botStatus = 'offline';
    return false;
  } catch (error) {
    console.error('Error checking bot status:', error);
    botStatus = 'unknown';
    return false;
  }
}

/**
 * Restart the main bot
 */
function restartMainBot() {
  try {
    console.log('Restarting main bot...');
    
    // Stop any existing bot process
    if (botProcessId) {
      try {
        process.kill(botProcessId, 'SIGTERM');
        console.log(`Terminated existing bot process with PID ${botProcessId}`);
      } catch (e) {
        // Ignore if process doesn't exist
      }
    }
    
    // Start new bot process
    const botProcess = exec('node index.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Bot process error: ${error.message}`);
        botStatus = 'offline';
        return;
      }
      if (stderr) {
        console.error(`Bot process stderr: ${stderr}`);
      }
    });
    
    // Save PID to file
    botProcessId = botProcess.pid.toString();
    fs.writeFileSync(pidFilePath, botProcessId);
    
    // Update status
    botStatus = 'online';
    botStartTime = Date.now();
    
    console.log(`Started new bot process with PID ${botProcessId}`);
  } catch (error) {
    console.error('Error restarting bot:', error);
    botStatus = 'error';
  }
}

/**
 * Format uptime in a human-readable way
 * @param {number} ms - Uptime in milliseconds
 * @returns {string} Formatted uptime string
 */
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
}

// Check bot status initially and every minute
checkBotStatus();
setInterval(checkBotStatus, 60000);

/**
 * Check the status of the main bot
 */
function checkBotStatus() {
  isMainBotRunning();
  
  // If bot is offline and it's been more than 5 minutes since the last ping
  const fiveMinutes = 5 * 60 * 1000;
  if (botStatus === 'offline' && (Date.now() - lastPing) < fiveMinutes) {
    restartMainBot();
  }
}