const { Events, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = (client) => {
  const VERIFY_CHANNEL_ID = '1378653094312804392';
  const VERIFIED_ROLE_ID = '1378618525093990410';
  const SERVER_ID = '1363412626318561412';

  // When bot is ready, auto-send verify button
  client.once(Events.ClientReady, async () => {
    try {
      const guild = client.guilds.cache.get(SERVER_ID);
      const channel = guild.channels.cache.get(VERIFY_CHANNEL_ID);

      if (!channel) return console.warn('⚠️ Verify channel not found.');

      const button = new ButtonBuilder()
        .setCustomId('verify_me')
        .setLabel('✅ Verify')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await channel.send({
        content: `Welcome! Please click the button below to verify yourself.`,
        components: [row]
      });

      console.log('✅ Verify button sent in channel.');
    } catch (err) {
      console.error('❌ Failed to send verify button:', err);
    }
  });

  // When someone clicks the verify button
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'verify_me') return;

    const guild = client.guilds.cache.get(SERVER_ID);
    const member = guild.members.cache.get(interaction.user.id);
    const role = guild.roles.cache.get(VERIFIED_ROLE_ID);

    if (!role) {
      return interaction.reply({
        content: '❌ "Verified" role not found in server.',
        ephemeral: true
      });
    }

    try {
      await member.roles.add(role);
      await interaction.reply({
        content: '✅ You have been verified!',
        ephemeral: true
      });
    } catch (err) {
      console.error(`❌ Failed to assign role to ${interaction.user.tag}`, err);
      await interaction.reply({
        content: '❌ Could not verify you. Contact staff.',
        ephemeral: true
      });
    }
  });
};