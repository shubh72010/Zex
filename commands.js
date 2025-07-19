// commands.js

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


const commands = [ new SlashCommandBuilder().setName('ban').setDescription('Ban a user') .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

new SlashCommandBuilder().setName('kick').setDescription('Kick a user') .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

new SlashCommandBuilder().setName('clear').setDescription('Delete messages') .addIntegerOption(o => o.setName('amount').setDescription('Number of messages').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

new SlashCommandBuilder().setName('say').setDescription('Make bot say something') .addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

new SlashCommandBuilder().setName('embed').setDescription('Send embed message') .addStringOption(o => o.setName('text').setDescription('Embed text').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

new SlashCommandBuilder().setName('dm').setDescription('DM a user') .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)) .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

new SlashCommandBuilder().setName('mute').setDescription('Mute a user') .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

new SlashCommandBuilder().setName('unmute').setDescription('Unmute a user') .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),

new SlashCommandBuilder().setName('warn').setDescription('Warn a user') .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)) .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

new SlashCommandBuilder().setName('warnings').setDescription('Check user warnings') .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

new SlashCommandBuilder().setName('userinfo').setDescription('User info') .addUserOption(o => o.setName('user').setDescription('Target user')),

new SlashCommandBuilder().setName('serverinfo').setDescription('Server info'),

new SlashCommandBuilder().setName('ping').setDescription('Bot latency'),

new SlashCommandBuilder().setName('poll').setDescription('Start a yes/no poll') .addStringOption(o => o.setName('question').setDescription('Poll?').setRequired(true)),

new SlashCommandBuilder().setName('help').setDescription('Help menu'),

new SlashCommandBuilder().setName('avatar').setDescription('User avatar') .addUserOption(o => o.setName('user').setDescription('User')),

new SlashCommandBuilder().setName('slowmode').setDescription('Set slowmode') .addIntegerOption(o => o.setName('seconds').setDescription('Seconds').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

new SlashCommandBuilder().setName('lock').setDescription('Lock current channel') .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

new SlashCommandBuilder().setName('unlock').setDescription('Unlock current channel') .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

new SlashCommandBuilder().setName('announce').setDescription('Make announcement') .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

new SlashCommandBuilder().setName('nickname').setDescription('Change nickname') .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)) .addStringOption(o => o.setName('nickname').setDescription('New nickname').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

new SlashCommandBuilder().setName('purge').setDescription('Delete all messages') .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

new SlashCommandBuilder().setName('role').setDescription('Info on a role') .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true)),

new SlashCommandBuilder().setName('addrole').setDescription('Add role to user') .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true)) .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

new SlashCommandBuilder().setName('removerole').setDescription('Remove role from user') .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true)) .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)) .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

new SlashCommandBuilder().setName('quote').setDescription('Send a random quote'),

new SlashCommandBuilder().setName('flip').setDescription('Flip a coin'),

new SlashCommandBuilder().setName('uptime').setDescription('Check bot uptime'),

new SlashCommandBuilder().setName('status').setDescription('Bot status'),

new SlashCommandBuilder().setName('suggest').setDescription('Send a suggestion') .addStringOption(o => o.setName('text').setDescription('Your suggestion').setRequired(true)),

new SlashCommandBuilder().setName('report').setDescription('Report a user') .addUserOption(o => o.setName('user').setDescription('Who?').setRequired(true)) .addStringOption(o => o.setName('reason').setDescription('Why?').setRequired(true)),

new SlashCommandBuilder().setName('snipe').setDescription('Get last deleted message'),

new SlashCommandBuilder().setName('botinfo').setDescription('Bot details'),

new SlashCommandBuilder().setName('invite').setDescription('Bot invite link'),

new SlashCommandBuilder().setName('afk').setDescription('Set AFK status') .addStringOption(o => o.setName('reason').setDescription('AFK Reason')) ];

module.exports = commands;

