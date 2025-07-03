// cmd.js — Logic for all ZEX commands const { EmbedBuilder, PermissionsBitField } = require('discord.js'); const moment = require('moment');

// temp memory stores const warnings = new Map(); const afkMap = new Map(); let snipeData = null;

module.exports = async (interaction) => { const { commandName, options, member, guild, user, channel, client } = interaction;

try { switch (commandName) { case 'ping': return interaction.reply(🏓 Pong! ${client.ws.ping}ms);

case 'say': {
    const text = options.getString('text');
    await interaction.reply({ content: '✅ Sent!', ephemeral: true });
    return channel.send(text);
  }

  case 'ban': {
    const target = options.getUser('user');
    const targetMember = await guild.members.fetch(target.id);
    await targetMember.ban();
    return interaction.reply(`🔨 Banned ${target.tag}`);
  }

  case 'kick': {
    const target = options.getUser('user');
    const targetMember = await guild.members.fetch(target.id);
    await targetMember.kick();
    return interaction.reply(`👢 Kicked ${target.tag}`);
  }

  case 'clear': {
    const amount = options.getInteger('amount');
    await channel.bulkDelete(amount, true);
    return interaction.reply({ content: `🧹 Cleared ${amount} messages`, ephemeral: true });
  }

  case 'mute': {
    const target = options.getUser('user');
    const targetMember = await guild.members.fetch(target.id);
    await targetMember.timeout(60 * 60 * 1000); // 1 hour
    return interaction.reply(`🔇 Muted ${target.tag} for 1 hour.`);
  }

  case 'unmute': {
    const target = options.getUser('user');
    const targetMember = await guild.members.fetch(target.id);
    await targetMember.timeout(null);
    return interaction.reply(`🔊 Unmuted ${target.tag}`);
  }

  case 'warn': {
    const target = options.getUser('user');
    const reason = options.getString('reason');
    const key = `${guild.id}-${target.id}`;
    if (!warnings.has(key)) warnings.set(key, []);
    warnings.get(key).push(reason);
    return interaction.reply(`⚠️ Warned ${target.tag} for: ${reason}`);
  }

  case 'warnings': {
    const target = options.getUser('user');
    const key = `${guild.id}-${target.id}`;
    const userWarnings = warnings.get(key) || [];
    return interaction.reply(`📋 ${target.tag} has ${userWarnings.length} warnings.`);
  }

  case 'userinfo': {
    const target = options.getUser('user') || user;
    return interaction.reply(`${target.tag} (ID: ${target.id})`);
  }

  case 'serverinfo':
    return interaction.reply(`${guild.name} | ID: ${guild.id} | Members: ${guild.memberCount}`);

  case 'poll': {
    const q = options.getString('question');
    const msg = await channel.send(`📊 **${q}**

👍 = Yes 👎 = No`); await msg.react('👍'); await msg.react('👎'); return interaction.reply({ content: '✅ Poll started', ephemeral: true }); }

case 'help':
    return interaction.reply('📜 Full list of commands: `/ban`, `/kick`, `/say`, `/ping`, `/userinfo`, etc.');

  case 'avatar': {
    const target = options.getUser('user') || user;
    return interaction.reply(target.displayAvatarURL({ dynamic: true, size: 1024 }));
  }

  case 'slowmode': {
    const secs = options.getInteger('seconds');
    await channel.setRateLimitPerUser(secs);
    return interaction.reply(`🐌 Slowmode set to ${secs}s`);
  }

  case 'lock':
    await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
    return interaction.reply('🔒 Channel locked');

  case 'unlock':
    await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
    return interaction.reply('🔓 Channel unlocked');

  case 'announce': {
    const msg = options.getString('message');
    return channel.send(`📢 ${msg}`);
  }

  case 'nickname': {
    const target = options.getUser('user');
    const name = options.getString('nickname');
    const targetMember = await guild.members.fetch(target.id);
    await targetMember.setNickname(name);
    return interaction.reply(`✏️ Changed nickname of ${target.tag}`);
  }

  case 'purge':
    const messages = await channel.messages.fetch();
    await channel.bulkDelete(messages);
    return interaction.reply('🧼 Purged all messages');

  case 'role': {
    const role = options.getRole('role');
    return interaction.reply(`Role: ${role.name} | ID: ${role.id} | Members: ${role.members.size}`);
  }

  case 'addrole': {
    const target = options.getUser('user');
    const role = options.getRole('role');
    const targetMember = await guild.members.fetch(target.id);
    await targetMember.roles.add(role);
    return interaction.reply(`➕ Added ${role.name} to ${target.tag}`);
  }

  case 'removerole': {
    const target = options.getUser('user');
    const role = options.getRole('role');
    const targetMember = await guild.members.fetch(target.id);
    await targetMember.roles.remove(role);
    return interaction.reply(`➖ Removed ${role.name} from ${target.tag}`);
  }

  case 'dm': {
    const target = options.getUser('user');
    const msg = options.getString('message');
    await target.send(`📬 ${msg}`);
    return interaction.reply({ content: '✅ Message sent!', ephemeral: true });
  }

  case 'quote':
    return interaction.reply('💭 "Believe in yourself." – Some random quote');

  case 'flip':
    return interaction.reply(`🪙 ${Math.random() > 0.5 ? 'Heads' : 'Tails'}`);

  case 'uptime': {
    const uptime = moment.duration(client.uptime).humanize();
    return interaction.reply(`⏱️ Uptime: ${uptime}`);
  }

  case 'status':
    return interaction.reply('🟢 Online and working.');

  case 'suggest': {
    const idea = options.getString('text');
    return interaction.reply(`✅ Suggestion recorded: ${idea}`);
  }

  case 'report': {
    const target = options.getUser('user');
    const reason = options.getString('reason');
    return interaction.reply(`📣 Reported ${target.tag} for: ${reason}`);
  }

  case 'snipe':
    return interaction.reply(snipeData ? `🕵️ Last deleted: ${snipeData}` : '❌ Nothing to snipe.');

  case 'embed': {
    const text = options.getString('text');
    const embed = new EmbedBuilder().setColor('Purple').setDescription(text);
    return interaction.reply({ embeds: [embed] });
  }

  case 'botinfo':
    return interaction.reply(`🤖 Zex Bot | Servers: ${client.guilds.cache.size}`);

  case 'invite':
    return interaction.reply('🔗 [Invite Zex](https://discord.com/api/oauth2/authorize?client_id=YOUR_ID&permissions=8&scope=bot%20applications.commands)');

  case 'afk': {
    const reason = options.getString('reason') || 'AFK';
    afkMap.set(user.id, reason);
    return interaction.reply(`😴 Set AFK: ${reason}`);
  }

  default:
    return interaction.reply({ content: '❌ Unknown command.', ephemeral: true });
}

} catch (err) { console.error(err); if (!interaction.replied) interaction.reply({ content: '❌ Error occurred.', ephemeral: true }); } };

