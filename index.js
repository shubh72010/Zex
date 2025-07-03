const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Events } = require('discord.js');
require('dotenv').config();

// Create the Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Define commands
const commands = [
  new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Change a user\'s nickname')
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

// Register slash commands globally
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
})();

// Bot ready
client.once(Events.ClientReady, () => {
  console.log(`🟢 Logged in as ${client.user.tag}`);
});

// Slash command interaction handler
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'nickname') {
    try {
      const member = interaction.options.getMember('user');
      const nickname = interaction.options.getString('nickname');

      if (!interaction.member.permissions.has('ManageNicknames')) {
        await interaction.reply({ content: '❌ You don’t have permission to change nicknames.', ephemeral: true });
        return;
      }

      if (!member.manageable) {
        await interaction.reply({ content: '❌ I can’t change this user’s nickname.', ephemeral: true });
        return;
      }

      await member.setNickname(nickname);
      await interaction.reply(`✅ Changed nickname of ${member.user.tag} to **${nickname}**`);
    } catch (err) {
      console.error('❌ Error changing nickname:', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Something went wrong while changing nickname.', ephemeral: true });
      }
    }
  }
});

// Login
client.login(process.env.TOKEN);