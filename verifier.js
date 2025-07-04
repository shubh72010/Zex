const {
  Events,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const VERIFY_ROLE_ID = '1378618525093990410';
const VERIFICATION_FILE = path.join(__dirname, 'verified.json');

function loadData() {
  if (!fs.existsSync(VERIFICATION_FILE)) return {};
  return JSON.parse(fs.readFileSync(VERIFICATION_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(VERIFICATION_FILE, JSON.stringify(data, null, 2));
}

module.exports = function verifier(client) {
  let verifiedData = loadData();

  client.on(Events.GuildMemberAdd, async member => {
    sendVerifyDM(member);
  });

  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (interaction.customId === 'verify_me' || interaction.customId === 'reverify') {
      const role = interaction.guild.roles.cache.get(VERIFY_ROLE_ID);
      if (!role) {
        return interaction.reply({ content: '❌ Verification role not found.', ephemeral: true });
      }

      try {
        await member.roles.add(role);

        verifiedData[`${interaction.guildId}-${interaction.user.id}`] = Date.now();
        saveData(verifiedData);

        await interaction.reply({
          content: '✅ You have been verified!',
          ephemeral: true
        });
      } catch (err) {
        console.error(`❌ Failed to assign role to ${interaction.user.tag}:`, err);
        await interaction.reply({
          content: '❌ Something went wrong. Contact staff.',
          ephemeral: true
        });
      }
    }
  });

  // DAILY CHECKER
  setInterval(async () => {
    const now = Date.now();
    for (const key in verifiedData) {
      const [guildId, userId] = key.split('-');
      const lastVerified = verifiedData[key];

      if (now - lastVerified > 14 * 24 * 60 * 60 * 1000) {
        if (now - lastVerified < 15 * 24 * 60 * 60 * 1000) {
          // In grace period — DM reverify
          try {
            const guild = await client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);

            const button = new ButtonBuilder()
              .setCustomId('reverify')
              .setLabel('🔄 Reverify')
              .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder().addComponents(button);

            await member.send({
              content: `⚠️ You need to reverify within 24 hours to stay in **${guild.name}**.`,
              components: [row]
            });
          } catch (err) {
            console.warn(`⚠️ Could not DM ${userId}:`, err.message);
          }
        } else {
          // Grace period passed — kick
          try {
            const guild = await client.guilds.fetch(guildId);
            const member = await guild.members.fetch(userId);
            await member.kick('Failed to reverify within 14+1 days.');
            delete verifiedData[key];
            saveData(verifiedData);
            console.log(`👢 Kicked ${userId} for no reverify`);
          } catch (err) {
            console.error(`❌ Could not kick ${userId}:`, err.message);
          }
        }
      }
    }
  }, 60 * 60 * 1000); // Runs hourly
};

async function sendVerifyDM(member) {
  const verifyButton = new ButtonBuilder()
    .setCustomId('verify_me')
    .setLabel('✅ Verify')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(verifyButton);

  try {
    await member.send({
      content: `👋 Welcome to **${member.guild.name}**!\nPlease verify to access the server.`,
      components: [row]
    });
  } catch (err) {
    console.error(`❌ Couldn't DM ${member.user.tag}:`, err.message);
  }
}