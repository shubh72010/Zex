const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Events, PermissionFlagsBits, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js'); require('dotenv').config();

const express = require('express'); const handler = require('./cmds'); const automod = require('./automod');

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates ], partials: [Partials.Message, Partials.Channel, Partials.Reaction] });

const commands = require('./slashcommands');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => { try { console.log('🔄 Registering commands...'); await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands.map(cmd => cmd.toJSON()) }); console.log('✅ Commands registered.'); } catch (err) { console.error('❌ Command registration failed:', err); } })();

client.once(Events.ClientReady, () => { console.log(✅ Logged in as ${client.user.tag}); });

client.on(Events.InteractionCreate, async interaction => { if (interaction.isChatInputCommand()) { handler(interaction); } });

client.on(Events.GuildMemberAdd, async member => { try { const verifyButton = new ButtonBuilder() .setCustomId('verify_me') .setLabel('✅ Verify') .setStyle(ButtonStyle.Success);

const row = new ActionRowBuilder().addComponents(verifyButton);

await member.send({
  content: `👋 Welcome to **${member.guild.name}**!\nPlease press the button below to verify yourself and access the server.`,
  components: [row]
});

} catch (err) { console.error(❌ Could not send verification DM to ${member.user.tag}, err); } });

client.on(Events.InteractionCreate, async interaction => { if (!interaction.isButton()) return;

if (interaction.customId === 'verify_me') { const guild = client.guilds.cache.get(interaction.guildId); const member = guild.members.cache.get(interaction.user.id); const role = guild.roles.cache.find(r => r.name.toLowerCase() === 'verified');

if (!role) {
  return interaction.reply({ content: '❌ "Verified" role not found in server.', ephemeral: true });
}

try {
  await member.roles.add(role);
  await interaction.reply({ content: '✅ You have been verified and given access to the server!', ephemeral: true });
} catch (err) {
  console.error(`❌ Failed to assign role to ${interaction.user.tag}`, err);
  await interaction.reply({ content: '❌ Could not verify you. Contact staff.', ephemeral: true });
}

} });

automod(client);

client.login(process.env.TOKEN);

const app = express(); app.get('/', (_, res) => res.send('Zex Bot is running!')); app.listen(3000, () => console.log('🌐 Fake server listening on port 3000'));

