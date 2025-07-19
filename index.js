// index.js

const { Client, GatewayIntentBits, Partials, REST, Routes, Collection, PermissionsBitField } = require('discord.js'); const fs = require('fs'); const express = require('express'); const app = express(); const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Zex is live!')); app.listen(PORT, () => console.log(🌐 Fake server listening on port ${PORT}));

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers ], partials: [Partials.Channel] });

client.commands = new Collection(); const commands = []; const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) { const command = require(./commands/${file}); client.commands.set(command.data.name, command); commands.push(command.data.toJSON()); }

client.once('ready', () => { console.log(✅ Logged in as ${client.user.tag}); });

client.on('interactionCreate', async interaction => { if (!interaction.isChatInputCommand()) return;

const command = client.commands.get(interaction.commandName);

if (!command) return;

// Server-only and mod-only checks const modOnly = ['say', 'purge']; if (modOnly.includes(command.data.name)) { if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) { return interaction.reply({ content: '❌ You need Manage Messages permission to use this command.', ephemeral: true }); } }

try { await command.execute(interaction); } catch (error) { console.error(error); if (interaction.replied || interaction.deferred) { await interaction.followUp({ content: '❌ There was an error while executing this command!', ephemeral: true }); } else { await interaction.reply({ content: '❌ There was an error while executing this command!', ephemeral: true }); } } });

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => { try { console.log('🔄 Registering commands...'); await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }); console.log('✅ Slash commands registered successfully.'); } catch (error) { console.error('❌ Command registration failed:', error); } })();

client.login(process.env.TOKEN);

