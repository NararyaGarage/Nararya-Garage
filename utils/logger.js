/**
 * Custom Logger Utility
 * 
 * Provides consistent logging functionality across the application
 * with file-based persistence and colored console output.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 * Author: Nararya Garage Team
 * License: Proprietary and confidential
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Setup log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

// ANSI color codes for console logging
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Get current timestamp in a readable format
const getTimestamp = () => {
  return new Date().toISOString();
};

// Format a log message
const formatLogMessage = (level, message, meta = null) => {
  let formattedMessage = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}`;
  
  if (meta) {
    if (typeof meta === 'object') {
      formattedMessage += ` ${JSON.stringify(meta)}`;
    } else {
      formattedMessage += ` ${meta}`;
    }
  }
  
  return formattedMessage;
};

// Write to log file
const writeToLogFile = (filePath, message) => {
  fs.appendFileSync(filePath, message + '\n');
};

// Log levels
const LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (can be changed at runtime)
let currentLogLevel = LEVELS.INFO;

// Logger methods
const logger = {
  setLogLevel: (level) => {
    if (LEVELS[level] !== undefined) {
      currentLogLevel = LEVELS[level];
    }
  },
  
  error: (message, meta = null) => {
    if (currentLogLevel >= LEVELS.ERROR) {
      const formattedMessage = formatLogMessage('error', message, meta);
      console.error(`${colors.bgRed}${colors.white}ERROR${colors.reset} ${formattedMessage}`);
      writeToLogFile(errorLogPath, formattedMessage);
      writeToLogFile(combinedLogPath, formattedMessage);
    }
  },
  
  warn: (message, meta = null) => {
    if (currentLogLevel >= LEVELS.WARN) {
      const formattedMessage = formatLogMessage('warn', message, meta);
      console.warn(`${colors.yellow}WARN${colors.reset} ${formattedMessage}`);
      writeToLogFile(combinedLogPath, formattedMessage);
    }
  },
  
  info: (message, meta = null) => {
    if (currentLogLevel >= LEVELS.INFO) {
      const formattedMessage = formatLogMessage('info', message, meta);
      console.info(`${colors.green}INFO${colors.reset} ${formattedMessage}`);
      writeToLogFile(combinedLogPath, formattedMessage);
    }
  },
  
  debug: (message, meta = null) => {
    if (currentLogLevel >= LEVELS.DEBUG) {
      const formattedMessage = formatLogMessage('debug', message, meta);
      console.debug(`${colors.blue}DEBUG${colors.reset} ${formattedMessage}`);
      writeToLogFile(combinedLogPath, formattedMessage);
    }
  }
};

module.exports = { logger, LEVELS };
