const { Client, GatewayIntentBits, PermissionsBitField, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// Define slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member')
    .addUserOption(option =>
      option.setName('target').setDescription('User to kick').setRequired(true)),
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member')
    .addUserOption(option =>
      option.setName('target').setDescription('User to ban').setRequired(true)),
  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a number of messages (1-100)')
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Number of messages').setRequired(true)),
].map(cmd => cmd.toJSON());

// Register slash commands (global)
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Slash commands registered.');
  } catch (error) {
    console.error(error);
  }
});

// Command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'kick') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return interaction.reply({ content: "You don't have permission to kick members.", ephemeral: true });
    const member = interaction.options.getMember('target');
    if (!member) return interaction.reply({ content: "User not found.", ephemeral: true });
    try {
      await member.kick();
      interaction.reply({ content: `${member.user.tag} was kicked.` });
    } catch {
      interaction.reply({ content: "I couldn't kick that user.", ephemeral: true });
    }
  }

  if (interaction.commandName === 'ban') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return interaction.reply({ content: "You don't have permission to ban members.", ephemeral: true });
    const member = interaction.options.getMember('target');
    if (!member) return interaction.reply({ content: "User not found.", ephemeral: true });
    try {
      await member.ban();
      interaction.reply({ content: `${member.user.tag} was banned.` });
    } catch {
      interaction.reply({ content: "I couldn't ban that user.", ephemeral: true });
    }
  }

  if (interaction.commandName === 'clear') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
      return interaction.reply({ content: "You don't have permission to clear messages.", ephemeral: true });
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100)
      return interaction.reply({ content: 'Enter a number between 1 and 100.', ephemeral: true });
    await interaction.channel.bulkDelete(amount, true);
    interaction.reply({ content: `Deleted ${amount} messages.`, ephemeral: true });
  }
});

client.login(process.env.TOKEN);