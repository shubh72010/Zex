const { Events, PermissionFlagsBits } = require('discord.js');

const swearWords = ['fuck', 'shit', 'bitch', 'asshole'];
const inviteRegex = /(discord\.gg|discord\.com\/invite)\/\w+/gi;
const linkRegex = /https?:\/\/|www\./gi;
const emojiRegex = /<a?:\w+:\d+>|\p{Emoji}/gu;

const lastMessages = new Map(); // userId -> last message content
const ghostPings = new Map(); // messageId -> mentioned users

module.exports = (client) => {
  client.on(Events.MessageCreate, async (msg) => {
    if (!msg.guild || msg.author.bot) return;
    if (msg.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    const { content, author, member } = msg;
    const lc = content.toLowerCase();

    // 1. Swear Filter
    if (swearWords.some(word => lc.includes(word))) {
      await msg.delete().catch(() => {});
      return msg.channel.send(`${author}, watch your language! ❌`).then(m => setTimeout(() => m.delete(), 4000));
    }

    // 2. Invite Link Block
    if (inviteRegex.test(content)) {
      await msg.delete().catch(() => {});
      return msg.channel.send(`${author}, invite links are not allowed. 🚫`).then(m => setTimeout(() => m.delete(), 4000));
    }

    // 3. General Link Block
    if (linkRegex.test(content)) {
      await msg.delete().catch(() => {});
      return msg.channel.send(`${author}, links are blocked in this server. 🔗`).then(m => setTimeout(() => m.delete(), 4000));
    }

    // 4. CAPS Spam Detection
    const caps = content.replace(/[^A-Z]/g, '');
    if (caps.length > 10 && caps.length >= content.length * 0.7) {
      await msg.delete().catch(() => {});
      return msg.channel.send(`${author}, calm down with the CAPS. 🧢`).then(m => setTimeout(() => m.delete(), 4000));
    }

    // 5. Emoji Spam Detection
    const emojis = content.match(emojiRegex);
    if (emojis && emojis.length > 5) {
      await msg.delete().catch(() => {});
      return msg.channel.send(`${author}, too many emojis! 🥴`).then(m => setTimeout(() => m.delete(), 4000));
    }

    // 6. Repeat Message Filter
    const last = lastMessages.get(author.id);
    if (last && last === content) {
      await msg.delete().catch(() => {});
      return msg.channel.send(`${author}, stop repeating messages! 🔁`).then(m => setTimeout(() => m.delete(), 4000));
    } else {
      lastMessages.set(author.id, content);
    }

    // 7. Ghost Ping Detection (store mentions)
    if (msg.mentions.users.size > 0) {
      ghostPings.set(msg.id, msg.mentions.users.map(u => u.id));
    }
  });

  // 8. Ghost Ping Check on Delete
  client.on(Events.MessageDelete, async (msg) => {
    if (!msg.guild || msg.author?.bot) return;
    const mentions = ghostPings.get(msg.id);
    if (!mentions || mentions.length === 0) return;

    const mentionNames = mentions.map(id => `<@${id}>`).join(', ');
    const channel = msg.channel;
    ghostPings.delete(msg.id);

    return channel.send(`👻 Ghost ping detected! Message from <@${msg.author?.id}> mentioned: ${mentionNames}`).then(m => setTimeout(() => m.delete(), 6000));
  });

  // 9. Auto-warn + Temp Mute (after 3 filters triggered)
  const punishments = new Map(); // userId -> count

  client.on(Events.MessageDelete, async (msg) => {
    if (!msg.guild || !msg.author || msg.author.bot) return;
    if (msg.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    const userId = msg.author.id;
    const count = punishments.get(userId) || 0;
    punishments.set(userId, count + 1);

    // Auto-mute at 3 offenses
    if (count + 1 >= 3) {
      try {
        await msg.member.timeout(60_000); // 1 minute mute
        punishments.set(userId, 0);
        msg.channel.send(`${msg.author}, you have been muted for repeated violations. ⛔`).then(m => setTimeout(() => m.delete(), 6000));
      } catch {
        // couldn't mute
      }
    }
  });
};