const fs = require('fs');
const path = require('path');

// === File paths ===
const logFile = path.join(__dirname, 'zex.log');
const configFile = path.join(__dirname, 'logConfig.json');

// === Bundle presets ===
const bundles = {
  messages: ['message_sent', 'message_delete', 'message_edit'],
  members: ['member_join', 'member_leave', 'member_update'],
  voice: ['voice_update'],
  all: ['message_sent', 'message_delete', 'message_edit', 'member_join', 'member_leave', 'member_update', 'voice_update']
};

// === Read config ===
function getConfig() {
  if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, '{}');
  return JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

// === Save config ===
function saveConfig(config) {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

// === Set logging type or bundle ===
function setLogType(guildId, type, enabled) {
  const config = getConfig();
  if (!config[guildId]) config[guildId] = {};

  if (bundles[type]) {
    // Enable/disable all bundled types
    bundles[type].forEach(subType => {
      config[guildId][subType] = enabled;
    });
  } else {
    // Single type toggle
    config[guildId][type] = enabled;
  }

  saveConfig(config);
}

// === Check if a log type is enabled ===
function isLogEnabled(guildId, type) {
  const config = getConfig();
  return config[guildId]?.[type] === true;
}

// === Log to file and console ===
function logToFile(msg, type = 'LOG') {
  const line = `[${new Date().toISOString()}] [${type}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
}

// === Get all logging status for a guild ===
function getLogStatus(guildId) {
  const config = getConfig();
  return config[guildId] || {};
}

// === Export everything ===
module.exports = {
  setLogType,
  isLogEnabled,
  logToFile,
  getLogStatus,
  bundles
};