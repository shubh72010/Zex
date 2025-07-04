const { PermissionFlagsBits } = require('discord.js');
const logger = require('./logger');
const warnedUsers = new Map();
const snipedMessages = new Map();
const afkUsers = new Map();

function isMod(member) {
  return member.permissions.has(PermissionFlagsBits.ManageMessages);
}

module.exports = async (interaction) => {
  const { commandName, options, guild, member, client, channel, user } = interaction;

  try {
    switch (commandName) {

      case 'ping':
        return interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);

      case 'say': {
        if (!isMod(member)) {
          return interaction.reply({ content: "❌ Only moderators can use this command.", ephemeral: true });
        }
        const text = options.getString('text');
        await interaction.deferReply({ ephemeral: false });
        await interaction.deleteReply();
        await interaction.channel.send({ content: text });

        if (logger.isLogEnabled(guild.id, 'message_sent')) {
          logger.logToFile(`${user.tag} used /say → ${text}`, 'MESSAGE_SENT');
        }
        break;
      }

      case 'embed': {
        if (!isMod(member)) {
          return interaction.reply({ content: "❌ Only moderators can use this command.", ephemeral: true });
        }
        const text = options.getString('text');
        return interaction.reply({ embeds: [{ description: text }] });
      }

      case 'dm': {
        if (!isMod(member)) {
          return interaction.reply({ content: "❌ Only moderators can DM users with this command.", ephemeral: true });
        }
        const user = options.getUser('user');
        const message = options.getString('message');
        await user.send(message);
        return interaction.reply({ content: `📩 Message sent to ${user.tag}`, ephemeral: true });
      }

      case 'setlog': {
        const type = options.getString('type');
        const enabled = options.getBoolean('enabled');
        logger.setLogType(guild.id, type, enabled);
        return interaction.reply(`🛠 Logging for **${type}** is now **${enabled ? 'enabled' : 'disabled'}**.`);
      }

      case 'userinfo': {
        const user = options.getUser('user') || interaction.user;
        return interaction.reply({
          embeds: [{
            title: `${user.tag}`,
            thumbnail: { url: user.displayAvatarURL() },
            fields: [
              { name: 'ID', value: user.id },
              { name: 'Bot?', value: user.bot ? 'Yes' : 'No' },
              { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>` }
            ]
          }]
        });
      }

      case 'serverinfo': {
        return interaction.reply({
          embeds: [{
            title: `${guild.name}`,
            thumbnail: { url: guild.iconURL() },
            fields: [
              { name: 'ID', value: guild.id },
              { name: 'Owner', value: `<@${guild.ownerId}>` },
              { name: 'Members', value: `${guild.memberCount}` },
              { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>` }
            ]
          }]
        });
      }

      case 'avatar': {
        const user = options.getUser('user') || interaction.user;
        return interaction.reply(user.displayAvatarURL({ dynamic: true, size: 4096 }));
      }

      case 'flip': {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        return interaction.reply(`🪙 You got **${result}**!`);
      }

      case 'quote': {
        const quotes = [
          '"Be yourself; everyone else is already taken." - Oscar Wilde',
          '"Two things are infinite: the universe and human stupidity." - Albert Einstein',
          '"So it goes." - Kurt Vonnegut'
        ];
        const random = quotes[Math.floor(Math.random() * quotes.length)];
        return interaction.reply(random);
      }

      case 'uptime': {
        const totalSeconds = Math.floor(process.uptime());
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return interaction.reply(`🕒 Uptime: ${hours}h ${minutes}m ${seconds}s`);
      }

      case 'help': {
        return interaction.reply({
          embeds: [{
            title: '🛠 Commands List',
            description: 'Use `/command` to trigger. Example: `/ping`',
            fields: [
              { name: 'Moderation', value: '`ban`, `kick`, `clear`, `mute`, `unmute`, `warn`, `warnings`, `purge`, `addrole`, `removerole`, `nickname`, `lock`, `unlock`' },
              { name: 'Utility', value: '`say`, `poll`, `slowmode`, `dm`, `embed`, `announce`, `status`, `afk`, `suggest`, `report`' },
              { name: 'Info', value: '`userinfo`, `serverinfo`, `avatar`, `botinfo`, `invite`, `ping`, `uptime`, `role`' },
              { name: 'Fun', value: '`quote`, `flip`, `snipe`' }
            ]
          }]
        });
      }

      case 'invite':
        return interaction.reply(`🤖 [Invite me](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot+applications.commands)`);

      case 'botinfo':
        return interaction.reply({
          embeds: [{
            title: '🤖 Bot Info',
            fields: [
              { name: 'Name', value: client.user.tag },
              { name: 'ID', value: client.user.id },
              { name: 'Servers', value: `${client.guilds.cache.size}` },
              { name: 'Ping', value: `${client.ws.ping}ms` }
            ]
          }]
        });

      case 'status':
        return interaction.reply("✅ I'm online and ready!");

      case 'poll': {
        const question = options.getString('question');
        const msg = await interaction.reply({ content: `📊 ${question}`, fetchReply: true });
        await msg.react('👍');
        await msg.react('👎');
        break;
      }

      case 'clear': {
        const amount = options.getInteger('amount');
        const messages = await interaction.channel.bulkDelete(amount, true);
        return interaction.reply({ content: `🧹 Deleted ${messages.size} messages.`, ephemeral: true });
      }

      case 'lock': {
        await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
        return interaction.reply('🔒 Channel locked.');
      }

      case 'unlock': {
        await interaction.channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
        return interaction.reply('🔓 Channel unlocked.');
      }

      case 'nickname': {
        const user = options.getMember('user');
        const newNick = options.getString('nickname');
        await user.setNickname(newNick);
        return interaction.reply(`✏️ Nickname changed to ${newNick}`);
      }

      case 'addrole': {
        const user = options.getMember('user');
        const role = options.getRole('role');
        await user.roles.add(role);
        return interaction.reply(`✅ Added ${role.name} to ${user.user.tag}`);
      }

      case 'removerole': {
        const user = options.getMember('user');
        const role = options.getRole('role');
        await user.roles.remove(role);
        return interaction.reply(`✅ Removed ${role.name} from ${user.user.tag}`);
      }

      case 'ban': {
        const user = options.getUser('user');
        const member = guild.members.cache.get(user.id);
        await member.ban();
        if (logger.isLogEnabled(guild.id, 'member_update')) {
          logger.logToFile(`${user.tag} was banned.`, 'MEMBER_UPDATE');
        }
        return interaction.reply(`🔨 Banned ${user.tag}`);
      }

      case 'kick': {
        const user = options.getUser('user');
        const member = guild.members.cache.get(user.id);
        await member.kick();
        if (logger.isLogEnabled(guild.id, 'member_update')) {
          logger.logToFile(`${user.tag} was kicked.`, 'MEMBER_UPDATE');
        }
        return interaction.reply(`👢 Kicked ${user.tag}`);
      }

      case 'mute': {
        const target = options.getMember('user');
        await target.timeout(60 * 60 * 1000);
        return interaction.reply(`🔇 Muted ${target.user.tag} for 1 hour.`);
      }

      case 'unmute': {
        const target = options.getMember('user');
        await target.timeout(null);
        return interaction.reply(`🔊 Unmuted ${target.user.tag}`);
      }

      case 'warn': {
        const warned = options.getUser('user');
        const reason = options.getString('reason');
        if (!warnedUsers.has(warned.id)) warnedUsers.set(warned.id, []);
        warnedUsers.get(warned.id).push({ reason, date: new Date() });
        return interaction.reply(`⚠️ Warned ${warned.tag} for: ${reason}`);
      }

      case 'warnings': {
        const warned = options.getUser('user');
        const list = warnedUsers.get(warned.id) || [];
        if (list.length === 0) return interaction.reply(`${warned.tag} has no warnings.`);
        return interaction.reply(list.map((w, i) => `${i + 1}. ${w.reason} (${w.date.toDateString()})`).join('\n'));
      }

      case 'purge': {
        const messages = await channel.messages.fetch();
        await channel.bulkDelete(messages, true);
        return interaction.reply('🗑️ Channel purged.');
      }

      case 'slowmode': {
        const seconds = options.getInteger('seconds');
        await channel.setRateLimitPerUser(seconds);
        return interaction.reply(`🐌 Slowmode set to ${seconds}s`);
      }

      case 'announce': {
        const message = options.getString('message');
        await channel.send(`📢 ${message}`);
        return interaction.reply({ content: 'Announcement sent!', ephemeral: true });
      }

      case 'role': {
        const role = options.getRole('role');
        return interaction.reply({
          embeds: [{
            title: `📘 Role Info: ${role.name}`,
            fields: [
              { name: 'ID', value: role.id },
              { name: 'Color', value: role.hexColor },
              { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No' },
              { name: 'Position', value: `${role.position}` }
            ]
          }]
        });
      }

      case 'suggest': {
        const text = options.getString('text');
        return interaction.reply(`💡 Suggestion received: ${text}`);
      }

      case 'report': {
        const reported = options.getUser('user');
        const reason = options.getString('reason');
        return interaction.reply(`🚨 Report logged: ${reported.tag} — ${reason}`);
      }

      case 'afk': {
        const reason = options.getString('reason') || 'AFK';
        afkUsers.set(user.id, reason);
        return interaction.reply(`🛌 You're now AFK: ${reason}`);
      }

      case 'snipe': {
        const sniped = snipedMessages.get(channel.id);
        return sniped ? interaction.reply(sniped) : interaction.reply('❌ Nothing to snipe.');
      }

      default:
        return interaction.reply('❌ Command not yet implemented.');
    }

  } catch (err) {
    console.error(`❌ Error in command '${commandName}':`, err);
    return interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
  }
};

// Fake HTTP server for Render uptime
const express = require('express');
const app = express();
app.get('/', (_, res) => res.send('Zex Bot is running!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Fake server listening on port ${PORT}`));