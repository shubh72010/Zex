const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (!message.guild || message.author.bot) return;

    // Kick command
    if (message.content.startsWith('!kick')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply("You don't have permission to kick members.");
        }
        const member = message.mentions.members.first();
        if (!member) return message.reply("Please mention a user to kick.");
        try {
            await member.kick();
            message.channel.send(`${member.user.tag} was kicked.`);
        } catch (err) {
            message.reply("I couldn't kick that user.");
        }
    }

    // Ban command
    if (message.content.startsWith('!ban')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("You don't have permission to ban members.");
        }
        const member = message.mentions.members.first();
        if (!member) return messageerr) {
            message.reply("I couldn't ban that user.");
        }
    }
});

client.login(process.env.TOKEN);