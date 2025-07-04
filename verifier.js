const { Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');

const VERIFIED_ROLE_ID = '1378618525093990410';
const GUILD_ID = '1363412626318561412';
const REVERIFY_INTERVAL_DAYS = 14;
const REVERIFY_WINDOW_HOURS = 24;

module.exports = (client) => {
  // Send verification button when user joins
  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      const button = new ButtonBuilder()
        .setCustomId('verify_me')
        .setLabel('✅ Verify')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await member.send({
        content: `👋 Welcome to **${member.guild.name}**!\nPlease press the button below to verify yourself and access the server.`,
        components: [row]
      });
    } catch (err) {
      console.error(`❌ Could not send DM to ${member.user.tag}`, err);
    }
  });

  // Handle button interaction
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'verify_me') return;

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      return interaction.reply({ content: '❌ Guild not found.', flags: 64 });
    }

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ You are not in the server.', flags: 64 });
    }

    const role = guild.roles.cache.get(VERIFIED_ROLE_ID);
    if (!role) {
      return interaction.reply({ content: '❌ Verified role not found.', flags: 64 });
    }

    try {
      await member.roles.add(role);

      // Store verification time (in-memory for now)
      member.verifiedAt = Date.now();

      await interaction.reply({
        content: '✅ You have been verified!',
        flags: 64
      });
    } catch (err) {
      console.error(`❌ Failed to verify ${interaction.user.tag}`, err);
      await interaction.reply({
        content: '❌ Verification failed. Contact staff.',
        flags: 64
      });
    }
  });

  // Periodic check for reverification
  setInterval(async () => {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    const role = guild.roles.cache.get(VERIFIED_ROLE_ID);
    if (!role) return;

    const now = Date.now();

    const members = await guild.members.fetch();
    for (const member of members.values()) {
      if (!member.roles.cache.has(VERIFIED_ROLE_ID)) continue;

      // If no custom tracking, kick after 14 days no reverify
      const verifiedTimestamp = member.verifiedAt || 0;

      const daysSince = (now - verifiedTimestamp) / (1000 * 60 * 60 * 24);
      if (daysSince >= REVERIFY_INTERVAL_DAYS + REVERIFY_WINDOW_HOURS / 24) {
        try {
          await member.send(`🚨 You failed to reverify in time and have been kicked from **${guild.name}**.`);
        } catch (_) {}

        await member.kick('Failed to reverify in time');
        console.log(`👢 Kicked ${member.user.tag} for not reverifying.`);
      }
    }
  }, 1000 * 60 * 60); // runs hourly
};