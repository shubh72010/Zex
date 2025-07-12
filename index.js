const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Events, PermissionFlagsBits, Partials } = require('discord.js');
require('dotenv').config();

const express = require('express');
const app = express();
const handler = require('./cmds');
const automod = require('./automod');
const verifier = require('./verifier');
const logger = require('./logger');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const commands = [
  new SlashCommandBuilder().setName('ban').setDescription('Ban a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  new SlashCommandBuilder().setName('clear').setDescription('Delete messages')
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('say').setDescription('Make bot say something')
    .addStringOption(o => o.setName('text').setDescription('Text').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('embed').setDescription('Send embed message')
    .addStringOption(o => o.setName('text').setDescription('Embed text').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('dm').setDescription('DM a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('mute').setDescription('Mute a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
  new SlashCommandBuilder().setName('unmute').setDescription('Unmute a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
  new SlashCommandBuilder().setName('warn').setDescription('Warn a user')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('warnings').setDescription('Check user warnings')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('userinfo').setDescription('User info')
    .addUserOption(o => o.setName('user').setDescription('Target user')),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Server info'),
  new SlashCommandBuilder().setName('ping').setDescription('Bot latency'),
  new SlashCommandBuilder().setName('poll').setDescription('Start a yes/no poll')
    .addStringOption(o => o.setName('question').setDescription('Poll?').setRequired(true)),
  new SlashCommandBuilder().setName('help').setDescription('Help menu'),
  new SlashCommandBuilder().setName('avatar').setDescription('User avatar')
    .addUserOption(o => o.setName('user').setDescription('User')),
  new SlashCommandBuilder().setName('slowmode').setDescription('Set slowmode')
    .addIntegerOption(o => o.setName('seconds').setDescription('Seconds').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName('lock').setDescription('Lock current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName('unlock').setDescription('Unlock current channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  new SlashCommandBuilder().setName('announce').setDescription('Make announcement')
    .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('nickname').setDescription('Change nickname')
    .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
    .addStringOption(o => o.setName('nickname').setDescription('New nickname').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),
  new SlashCommandBuilder().setName('purge').setDescription('Delete all messages')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder().setName('role').setDescription('Info on a role')
    .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true)),
  new SlashCommandBuilder().setName('addrole').setDescription('Add role to user')
    .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder().setName('removerole').setDescription('Remove role from user')
    .addUserOption(o => o.setName('user').setDescription('Target').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder().setName('quote').setDescription('Send a random quote'),
  new SlashCommandBuilder().setName('flip').setDescription('Flip a coin'),
  new SlashCommandBuilder().setName('uptime').setDescription('Check bot uptime'),
  new SlashCommandBuilder().setName('status').setDescription('Bot status'),
  new SlashCommandBuilder().setName('suggest').setDescription('Send a suggestion')
    .addStringOption(o => o.setName('text').setDescription('Your suggestion').setRequired(true)),
  new SlashCommandBuilder().setName('report').setDescription('Report a user')
    .addUserOption(o => o.setName('user').setDescription('Who?').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Why?').setRequired(true)),
  new SlashCommandBuilder().setName('snipe').setDescription('Get last deleted message'),
  new SlashCommandBuilder().setName('botinfo').setDescription('Bot details'),
  new SlashCommandBuilder().setName('invite').setDescription('Bot invite link'),
  new SlashCommandBuilder().setName('afk').setDescription('Set AFK status')
    .addStringOption(o => o.setName('reason').setDescription('AFK Reason'))
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Registering commands...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands.map(cmd => cmd.toJSON())
    });
    console.log('✅ Commands registered.');
  } catch (err) {
    console.error('❌ Command registration failed:', err);
  }
})();

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  const verifyChannel = client.channels.cache.get('1378653094312804392');
  if (verifyChannel) {
    verifyChannel.send({
      content: '📢 To enter Zeta HS, you must have a verified phone number and email linked to your Discord account.\n\nReverification is required every 14 days. You will be reminded 24 hours before expiry, and failure to reverify results in removal from the server.'
    }).catch(console.error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    handler(interaction);
  }
});

// 🔁 DeepSeek Reply via Mention
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  if (message.mentions.has(client.user)) {
    const prompt = message.cleanContent;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'tngtech/deepseek-r1t2-chimera:free',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://zex.dortz.zone',
            'X-Title': 'ZEX-Core',
          },
        }
      );

      const reply = response.data.choices?.[0]?.message?.content;
      if (reply) message.reply(reply);
      else message.reply("🧠 I'm blank rn...");
    } catch (err) {
      console.error('ZEX AI error (DeepSeek):', err);
      message.reply('⚠️ My brain short-circuited');
    }
  }
});

automod(client);
verifier(client);
logger(client);
client.login(process.env.TOKEN);

// 🌐 Express API Setup
app.get('/', (_, res) => res.send('Zex Bot is running!'));

app.listen(3000, () => console.log('🌐 Fake server listening on port 3000'));

// POST /api/chat — DeepSeek Endpoint
app.post('/api/chat', express.json(), async (req, res) => {
  const { prompt } = req.body;
  if (!process.env.OPENROUTER_API_KEY || !prompt) {
    return res.status(400).json({ error: 'Missing prompt or API key.' });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'tngtech/deepseek-r1t2-chimera:free',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://zex.dortz.zone',
          'X-Title': 'ZEX-Core',
        },
      }
    );
    const reply = response.data.choices?.[0]?.message?.content;
    res.json({ reply });
  } catch (err) {
    console.error('ZEX AI error (API):', err);
    res.status(500).json({ error: 'ZEX failed to think.' });
  }
});