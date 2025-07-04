const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Events, PermissionFlagsBits, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js'); require('dotenv').config();

const express = require('express'); const handler = require('./cmds'); const automod = require('./automod');

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates ], partials: [Partials.Message, Partials.Channel, Partials.Reaction] });

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

new SlashCommandBuilder().setName('checkstrikes').setDescription("Check a user's strike count") .addUserOption(o => o.setName('user').setDescription('User').setRequired(true)),

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

new SlashCommandBuilder().setName('afk').setDescription('Set AFK status') .addStringOption(o => o.setName('reason').setDescription('AFK Reason')),

new SlashCommandBuilder().setName('setlog').setDescription('Enable or disable logs by type or bundle') .addStringOption(o => o.setName('type') .setDescription('Log type or bundle') .setRequired(true) .addChoices( { name: 'message_sent', value: 'message_sent' }, { name: 'message_delete', value: 'message_delete' }, { name: 'message_edit', value: 'message_edit' }, { name: 'member_join', value: 'member_join' }, { name: 'member_leave', value: 'member_leave' }, { name: 'member_update', value: 'member_update' }, { name: 'voice_update', value: 'voice_update' }, { name: 'messages (bundle)', value: 'messages' }, { name: 'members (bundle)', value: 'members' }, { name: 'voice (bundle)', value: 'voice' }, { name: 'all (bundle)', value: 'all' } ) ) .addBooleanOption(o => o.setName('enabled') .setDescription('Enable or disable logging') .setRequired(true) ) .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) ];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => { try { console.log('🔄 Registering commands...'); await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands.map(cmd => cmd.toJSON()) }); console.log('✅ Commands registered.'); } catch (err) { console.error('❌ Command registration failed:', err); } })();

client.once(Events.ClientReady, () => { console.log(✅ Logged in as ${client.user.tag}); });

client.on(Events.InteractionCreate, async interaction => { if (interaction.isChatInputCommand()) { handler(interaction); } });

client.on(Events.GuildMemberAdd, async member => { try { const verifyButton = new ButtonBuilder() .setCustomId('verify_me') .setLabel('✅ Verify') .setStyle(ButtonStyle.Success);

const row = new ActionRowBuilder().addComponents(verifyButton);

await member.send({
  content: `👋 Welcome to **${member.guild.name}**!\nPlease press the button below to verify yourself and access the server.`,
  components: [row]
});

} catch (err) { console.error(❌ Could not send verification DM to ${member.user.tag}, err); } });

client.on(Events.InteractionCreate, async interaction => { if (!interaction.isButton()) return;

if (interaction.customId === 'verify_me') { const guild = client.guilds.cache.get(interaction.guildId); const member = guild.members.cache.get(interaction.user.id); const role = guild.roles.cache.find(r => r.name.toLowerCase() === 'verified');

if (!role) {
  return interaction.reply({ content: '❌ "Verified" role not found in server.', ephemeral: true });
}

try {
  await member.roles.add(role);
  await interaction.reply({ content: '✅ You have been verified and given access to the server!', ephemeral: true });
} catch (err) {
  console.error(`❌ Failed to assign role to ${interaction.user.tag}`, err);
  await interaction.reply({ content: '❌ Could not verify you. Contact staff.', ephemeral: true });
}

} });

automod(client);

client.login(process.env.TOKEN);

const app = express(); app.get('/', (_, res) => res.send('Zex Bot is running!')); app.listen(3000, () => console.log('🌐 Fake server listening on port 3000'));

