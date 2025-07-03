const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'zex.log');
const configFile = path.join(__dirname, 'logConfig.json');

const bundles = {
  messages: ['message_sent', 'message_delete', 'message_edit'],
  members: ['member_join', 'member_leave', 'member_update'],
  voice: ['voice_update'],
  all: ['message_sent', 'message_delete', 'message_edit', 'member_join', 'member_leave', 'member_update', 'voice_update']
};

function getConfig() {
  if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, '{}');
  return JSON.parse(fs.readFileSync(configFile, 'utf8'));
}

function saveConfig(config) {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

function setLogType(guildId, type, enabled) {
  const config = getConfig();
  if (!config[guildId]) config[guildId] = {};

  if (bundles[type]) {
    bundles[type].forEach(t => config[guildId][t] = enabled);
  } else {
    config[guildId][type] = enabled;
  }

  saveConfig(config);
}

function isLogEnabled(guildId, type) {
  const config = getConfig();
  return config[guildId]?.[type] === true;
}

function logToFile(msg, type = 'LOG') {
  const line = `[${new Date().toISOString()}] [${type}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
}

function getLogStatus(guildId) {
  const config = getConfig();
  return config[guildId] || {};
}

module.exports = {
  setLogType,
  isLogEnabled,
  logToFile,
  getLogStatus,
  bundles
};