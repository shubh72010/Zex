// automod.js (full advanced version with strike + DM + filtering)

const { Events } = require('discord.js');

// Basic word filter - Add more as needed
const swearWords = [
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cunt', 'nigga', 'nigger', 'faggot', 'retard',
  'pussy', 'bastard', 'slut', 'whore', 'hoe', 'cock', 'nazi'
];

// In-memory strike storage
const strikes = new Map();

module.exports = (client) => {
  client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    const content = message.content.toLowerCase();
    const matched = swearWords.find(word => content.includes(word));

    if (matched) {
      try {
        // Delete the message
        await message.delete();

        // Strike key = guildID-userID
        const key = `${message.guild.id}-${message.author.id}`;
        const current = strikes.get(key) || 0;
        const updated = current + 1;
        strikes.set(key, updated);

        // DM the user
        try {
          await message.author.send(
            `⚠️ You used a banned word (**${matched}**) in **${message.guild.name}**.\n` +
            `You have received a **strike**. Total strikes: **${updated}**.`
          );
        } catch (_) {
          // User has DMs off
        }

        // Timeout after 3 strikes
        if (updated >= 3) {
          await message.member.timeout(10 * 60 * 1000); // 10 mins
          try {
            await message.author.send(`⛔ You have reached 3 strikes. You have been timed out for 10 minutes.`);
          } catch (_) {}
        }

        console.log(`User ${message.author.tag} warned for: ${matched}`);
      } catch (err) {
        console.error('❌ Error in automod:', err);
      }
    }
  });
};

// Export the strikes map for use in cmds.js
module.exports.strikes = strikes;
