const { Client, GatewayIntentBits, PermissionsBitField, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
  ]
});

// In-memory stores (replace with DB for production)
const userXP = new Map();
const userBalance = new Map();
const userDaily = new Map();
const userAFK = new Map();
const userWarnings = new Map();
const mutedUsers = new Set();

// Define slash commands
const commands = [
  // User info
  new SlashCommandBuilder().setName('('User to view').setRequired(false)),
  new SlashCommandBuilder().setName('avatar').setDescription('Sends user\'s profile picture.').addUserOption(o=>o.setName('user').setDescription('User to show').setRequired(false)),
  new SlashCommandBuilder().setName('nickname').setDescription('Changes a user’s nickname.').addUserOption(o=>o.setName('user').setDescription('User').setRequired(true)).addStringOption(o=>o.setName('nickname').setDescription('New nickname').setRequired(true)),
  new SlashCommandBuilder().setName('dm').setDescription('Sends a DM to a user.').addUserOption(o=>o.setName('user').setDescription('User to DM').setRequired(true)).addStringOption(o=>o.setName('message').setDescription('Message').setRequired(true)),
  new SlashCommandBuilder().setName('afk').setDescription('Sets your AFK status.').addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(false)),
  new SlashCommandBuilder().setName('ping').setDescription('Shows bot\'s response time.'),
  new SlashCommandBuilder().setName('status').setDescription('Shows if the bot is online and working.'),
  new SlashCommandBuilder().setName('level').setDescription('Displays user\'s XP level.').addUserOption(o=>o.setName('user').setDescription('User').setRequired(false)),
  new SlashCommandBuilder().setName('balance').setDescription('Shows user\'s currency balance.').addUserOption(o=>o.setName('user').setDescription('User').setRequired(false)),
  new SlashCommandBuilder().setName('daily').setDescription('Get your daily currency reward!'),

  // Moderation
  new SlashCommandBuilder().setName('ban').setDescription('Bans a user.').addUserOption(o=>o.setName('user').setDescription('User to ban').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(false)),
  new SlashCommandBuilder().setName('kick').setDescription('Kicks a user.').addUserOption(o=>o.setName('user').setDescription('User to kick').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(false)),
  new SlashCommandBuilder().setName('clear').setDescription('Deletes messages.').addIntegerOption(o=>o.setName('amount').setDescription('Amount (1-100)').setRequired(true)),
  new SlashCommandBuilder().setName('mute').setDescription('Mutes a user.').addUserOption(o=>o.setName('user').setDescription('User to mute').setRequired(true)),
  new SlashCommandBuilder().setName('unmute').setDescription('Unmutes a user.').addUserOption(o=>o.setName('user').setDescription('User to unmute').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('Warns a user.').addUserOption(o=>o.setName('user').setDescription('User to warn').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(true)),
  new SlashCommandBuilder().setName('warnings').setDescription('Shows warnings for a user.').addUserOption(o=>o.setName('user').setDescription('User').setRequired(false)),
  new SlashCommandBuilder().setName('lock').setDescription('Locks the channel for everyone.'),
  new SlashCommandBuilder().setName('unlock').setDescription('Unlocks the channel.'),
  new SlashCommandBuilder().setName('slowmode').setDescription('Enables slowmode in the channel.').addIntegerOption(o=>o.setName('seconds').setDescription('Seconds per user (0 to disable)').setRequired(true)),
].map(cmd => cmd.toJSON());

// Register commands
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Slash commands registered.');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // Helper for option or default to command user
  const getUser = (name) => interaction.options.getUser(name) || interaction.user;
  const getMember = (name) => interaction.options.getMember(name) || interaction.member;

  // Userinfo
  if (interaction.commandName === 'userinfo') {
    const user = getUser('user');
    const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(() => null);
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Info`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "ID", value: user.id, inline: true },
        { name: "Tag", value: user.tag, inline: true },
        { name: "Joined", value: member?.joinedAt?.toLocaleString() || "Unknown", inline: true },
        { name: "Roles", value: member?.roles.cache.map(r=>r.name).join(", ") || "None", inline: false }
      );
    interaction.reply({ embeds: [embed] });
  }

  // Avatar
  else if (interaction.commandName === 'avatar') {
    const user = getUser('user');
    interaction.reply({ content: user.displayAvatarURL({ size: 4096 }) });
  }

  // Nickname
  else if (interaction.commandName === 'nickname') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames))
      return interaction.reply({ content: "Missing permission: Manage Nicknames", ephemeral: true });
    const member = interaction.options.getMember('user');
    const nick = interaction.options.getString('nickname');
    if (!member) return interaction.reply({ content: "User not found", ephemeral: true });
    await member.setNickname(nick).catch(() => {});
    interaction.reply({ content: `Changed nickname for ${member.user.tag} to ${nick}` });
  }

  // DM
  else if (interaction.commandName === 'dm') {
    const user = interaction.options.getUser('user');
    const msg = interaction.options.getString('message');
    user.send(msg).then(() => {
      interaction.reply({ content: `DM sent to ${user.tag}`, ephemeral: true });
    }).catch(() => {
      interaction.reply({ content: `Could not DM ${user.tag}`, ephemeral: true });
    });
  }

  // AFK
  else if (interaction.commandName === 'afk') {
    const reason = interaction.options.getString('reason') || 'AFK';
    userAFK.set(interaction.user.id, reason);
    interaction.reply({ content: `You are now AFK: ${reason}` });
  }

  // Ping
  else if (interaction.commandName === 'ping') {
    const sent = Date.now();
    interaction.reply({ content: 'Pinging...' }).then(() => {
      interaction.editReply({ content: `Pong! Latency: ${Date.now() - sent}ms` });
    });
  }

  // Status
  else if (interaction.commandName === 'status') {
    interaction.reply({ content: 'Bot is online and working!' });
  }

  // Level (XP)
  else if (interaction.commandName === 'level') {
    const user = getUser('user');
    const xp = userXP.get(user.id) || 0;
    const level = Math.floor(xp / 100);
    interaction.reply({ content: `${user.username}'s XP: ${xp} | Level: ${level}` });
  }

  // Balance (Economy)
  else if (interaction.commandName === 'balance') {
    const user = getUser('user');
    const bal = userBalance.get(user.id) || 0;
    interaction.reply({ content: `${user.username} has $${bal}` });
  }

  // Daily
  else if (interaction.commandName === 'daily') {
    const uid = interaction.user.id;
    const last = userDaily.get(uid) || 0;
    if (Date.now() - last < 24*60*60*1000) {
      return interaction.reply({ content: 'You already claimed your daily reward! Try again later.', ephemeral: true });
    }
    const amount = 500;
    userBalance.set(uid, (userBalance.get(uid) || 0) + amount);
    userDaily.set(uid, Date.now());
    interaction.reply({ content: `You got $${amount} as a daily reward!` });
  }

  // Ban
  else if (interaction.commandName === 'ban') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return interaction.reply({ content: "You don't have permission to ban.", ephemeral: true });
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason';
    if (!member) return interaction.reply({ content: "User not found", ephemeral: true });
    await member.ban({ reason }).catch(() => {});
    interaction.reply({ content: `Banned ${member.user.tag}. Reason: ${reason}` });
  }

  // Kick
  else if (interaction.commandName === 'kick') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return interaction.reply({ content: "You don't have permission to kick.", ephemeral: true });
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason';
    if (!member) return interaction.reply({ content: "User not found", ephemeral: true });
    await member.kick(reason).catch(() => {});
    interaction.reply({ content: `Kicked ${member.user.tag}. Reason: ${reason}` });
  }

  // Clear
  else if (interaction.commandName === 'clear') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return interaction.reply({ content: "You don't have permission to clear messages.", ephemeral: true });
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100)
      return interaction.reply({ content: 'Enter a number between 1 and 100.', ephemeral: true });
    await interaction.channel.bulkDelete(amount, true);
    interaction.reply({ content: `Deleted ${amount} messages.`, ephemeral: true });
  }

  // Mute
  else if (interaction.commandName === 'mute') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return interaction.reply({ content: "You don't have permission to mute.", ephemeral: true });
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ content: "User not found", ephemeral: true });
    await member.timeout(24*60*60*1000).catch(() => {});
    mutedUsers.add(member.id);
    interaction.reply({ content: `${member.user.tag} has been muted (timeout for 24h).` });
  }

  // Unmute
  else if (interaction.commandName === 'unmute') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return interaction.reply({ content: "You don't have permission to unmute.", ephemeral: true });
    const member = interaction.options.getMember('user');
    if (!member) return interaction.reply({ content: "User not found", ephemeral: true });
    await member.timeout(null).catch(() => {});
    mutedUsers.delete(member.id);
    interaction.reply({ content: `${member.user.tag} has been unmuted.` });
  }

  // Warn
  else if (interaction.commandName === 'warn') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return interaction.reply({ content: "You don't have permission to warn.", ephemeral: true });
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const warnings = userWarnings.get(user.id) || [];
    warnings.push({ by: interaction.user.tag, reason, date: new Date().toLocaleString() });
    userWarnings.set(user.id, warnings);
    interaction.reply({ content: `${user.tag} has been warned. Reason: ${reason}` });
  }

  // Warnings
  else if (interaction.commandName === 'warnings') {
    const user = getUser('user');
    const warnings = userWarnings.get(user.id) || [];
    if (!warnings.length) return interaction.reply({ content: `${user.tag} has no warnings.` });
    let text = warnings.map((w, i) => `${i+1}. By: ${w.by}\nReason: ${w.reason}\nDate: ${w.date}`).join('\n\n');
    interaction.reply({ content: `Warnings for ${user.tag}:\n${text}` });
  }

  // Lock
  else if (interaction.commandName === 'lock') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: "You don't have permission to lock.", ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    interaction.reply({ content: "Channel locked." });
  }

  // Unlock
  else if (interaction.commandName === 'unlock') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: "You don't have permission to unlock.", ephemeral: true });
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
    interaction.reply({ content: "Channel unlocked." });
  }

  // Slowmode
  else if (interaction.commandName === 'slowmode') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return interaction.reply({ content: "You don't have permission to set slowmode.", ephemeral: true });
    const seconds = interaction.options.getInteger('seconds');
    await interaction.channel.setRateLimitPerUser(seconds);
    interaction.reply({ content: `Slowmode set to ${seconds} seconds.` });
  }
});

// Example XP gain on message
client.on('messageCreate', msg => {
  if (msg.author.bot) return;
  // Remove AFK on message
  if (userAFK.has(msg.author.id)) {
    userAFK.delete(msg.author.id);
    msg.reply('Your AFK status has been removed!');
  }
  // XP system
  userXP.set(msg.author.id, (userXP.get(msg.author.id) || 0) + Math.floor(Math.random() * 9 + 1));
  // AFK mention
  msg.mentions.users.forEach(user => {
    if (userAFK.has(user.id)) {
      msg.reply(`${user.username} is AFK: ${userAFK.get(user.id)}`);
    }
  });
});

client.login(process.env.TOKEN);