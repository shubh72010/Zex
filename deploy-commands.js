const { SlashCommandBuilder, REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('Enable or disable logs by type or bundle')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Log type or bundle')
        .setRequired(true)
        .addChoices(
          { name: 'message_sent', value: 'message_sent' },
          { name: 'message_delete', value: 'message_delete' },
          { name: 'message_edit', value: 'message_edit' },
          { name: 'member_join', value: 'member_join' },
          { name: 'member_leave', value: 'member_leave' },
          { name: 'member_update', value: 'member_update' },
          { name: 'voice_update', value: 'voice_update' },
          { name: 'messages (bundle)', value: 'messages' },
          { name: 'members (bundle)', value: 'members' },
          { name: 'voice (bundle)', value: 'voice' },
          { name: 'all (bundle)', value: 'all' }
        )
    )
    .addBooleanOption(option =>
      option.setName('enabled')
        .setDescription('Enable or disable logging')
        .setRequired(true)
    )
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Registering commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Commands registered.');
  } catch (err) {
    console.error('❌ Command registration failed:', err);
  }
})();