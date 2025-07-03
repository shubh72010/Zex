const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Events } = require('discord.js');
require('dotenv').config();

// Create bot instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Define slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Changes a user\'s nickname.')
    .addUserOption(option =>
      option.setName('user')
            .setDescription('User to rename')
            .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('nickname')
            .setDescription('New nickname')
            .setRequired(true)
    )
].map(command => command.toJSON());

// Register commands
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (error) {
    console.error('❌ Failed to register commands:', error);
  }
})();

// When bot is ready
client.once(Events.ClientReady, () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);
});

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'nickname') {
    const member = interaction.options.getMember('user');
    const nickname = interaction.options.getString('nickname');

    if (!interaction.member.permissions.has('ManageNicknames')) {
      return interaction.reply({ content: '❌ You don’t have permission to change nicknames.', ephemeral: true });
    }

    if (!member.manageable) {
      return interaction.reply({ content: '❌ I can’t change this user’s nickname.', ephemeral: true });
    }

    try {
      await member.setNickname(nickname);
      await interaction.reply(`✅ Changed nickname of ${member.user.tag} to **${nickname}**`);
    } catch (err) {
      console.error(err);
      interaction.reply({ content: '❌ Failed to change nickname.', ephemeral: true });
    }
  }
});

// Login bot
client.login(process.env.TOKEN);