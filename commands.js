const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('./logger');

const warnedUsers = new Map();
const snipedMessages = new Map();
const afkUsers = new Map();

const isMod = member => member.permissions.has(PermissionFlagsBits.ManageMessages);

// Slash command definitions
const commands = [
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Say something through the bot')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to say')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send an embed message')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Embed title')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Embed description')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Poll question')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Set the bot\'s status')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('online/dnd/idle/invisible')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Status text')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set yourself AFK')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for AFK')
        .setRequired(false)
    )
];

// Keep-alive ping for Render hosting
require('http')
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is alive');
  })
  .listen(3000);

// Export everything
module.exports = {
  commands: commands.map(command => command.toJSON()),
  logger,
  warnedUsers,
  snipedMessages,
  afkUsers,
  isMod
};