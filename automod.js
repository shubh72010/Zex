const { EmbedBuilder } = require('discord.js');
const snipedMessages = new Map();
const afkUsers = new Map();

// 1. 🧠 Advanced bad word filter (regex-based, partial match)
const badWords = [
  /f+u+c*k+/gi,
  /s+h+i+t+/gi,
  /b+i+t+c+h+/gi,
  /n+i+g+/gi,
  /a+s+s+h+o+l+e+/gi,
  /d+i+c+k+/gi,
  /c+u+n+t+/gi,
  /p+u+s+s+y+/gi,
  /c+o+c+k+/gi,
  /k+y+s+/gi
];

module.exports = (client) => {
  client.on('messageDelete', msg => {
    if (!msg.partial && msg.content) {
      snipedMessages.set(msg.channel.id, `🗑️ Deleted by ${msg.author.tag}: ${msg.content}`);
      setTimeout(() => snipedMessages.delete(msg.channel.id), 60_000);
    }
  });

  client.on('messageCreate', async (msg) => {
    if (msg.author.bot || !msg.guild) return;

    const content = msg.content.toLowerCase();

    // 1. ❌ Filter message
    const found = badWords.find(pattern => pattern.test(content));
    if (found) {
      await msg.delete();

      // 3. 🪵 Log to mod-log channel
      const logChannel = msg.guild.channels.cache.find(c => c.name === 'mod-logs' || c.name === 'logs');
      const embed = new EmbedBuilder()
        .setTitle('🚫 Filtered Message')
        .addFields(
          { name: 'User', value: `${msg.author.tag} (${msg.author.id})`, inline: true },
          { name: 'Channel', value: `<#${msg.channel.id}>`, inline: true },
          { name: 'Content', value: `\`\`\`${msg.content.slice(0, 1000)}\`\`\`` }
        )
        .setTimestamp()
        .setColor(0xFF0000);

      if (logChannel) await logChannel.send({ embeds: [embed] });

      // Notify offender
      await msg.channel.send(`⚠️ <@${msg.author.id}> watch your language.`);
      return;
    }

    // Mentioning AFK user
    const mentionedAFKs = msg.mentions.users.filter(u => afkUsers.has(u.id));
    for (const afkUser of mentionedAFKs.values()) {
      msg.reply(`💤 <@${afkUser.id}> is AFK: ${afkUsers.get(afkUser.id)}`);
    }

    // Remove AFK if they return
    if (afkUsers.has(msg.author.id)) {
      afkUsers.delete(msg.author.id);
      msg.reply('👋 Welcome back! AFK status removed.');
    }
  });
};

module.exports.snipedMessages = snipedMessages;
module.exports.afkUsers = afkUsers;