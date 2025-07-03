module.exports = async (interaction) => {
  const { commandName, options, guild, member, client } = interaction;

  try {
    switch (commandName) {
      case 'ping':
        return interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);

      case 'say': {
        const text = options.getString('text');
        return interaction.reply({ content: text });
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

      case 'embed': {
        const text = options.getString('text');
        return interaction.reply({ embeds: [{ description: text }] });
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

      default:
        return interaction.reply('❌ Command not yet implemented.');
    }
  } catch (err) {
    console.error(`❌ Error in command '${commandName}':`, err);
    return interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
  }
};
