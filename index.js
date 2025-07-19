// index.js
const {
  Client, GatewayIntentBits, REST, Routes,
  Events, PermissionFlagsBits, Partials
} = require('discord.js');
require('dotenv').config();

const express = require('express');
const app = express();

const automod = require('./automod');
const verifier = require('./verifier');
const logger = require('./logger');
const axios = require('axios');
const commands = require('./commands');

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

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// 🔄 Register slash commands
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

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  try {
    const verifyChannel = await client.channels.fetch('1378653094312804392');
    await verifyChannel.send({
      content: '📢 To enter Zeta HS, you must have a verified phone number and email linked to your Discord account.\n\nReverification is required every 14 days. You will be reminded 24 hours before expiry, and failure to reverify results in removal from the server.'
    });
  } catch (err) {
    console.error('❌ Failed to send verification message:', err);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    try {
      await handler(interaction);
    } catch (err) {
      console.error('❌ Interaction handler error:', err);
      if (interaction.replied || interaction.deferred) {
        interaction.followUp({ content: '⚠️ Error occurred.', ephemeral: true });
      } else {
        interaction.reply({ content: '⚠️ Error occurred.', ephemeral: true });
      }
    }
  }
});

// 🧠 AI Mention Reply
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  if (message.mentions.has(client.user)) {
    const prompt = message.cleanContent;
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openrouter/cypher-alpha:free',
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://zex.dortz.zone',
            'X-Title': 'ZEX-Core'
          }
        }
      );

      const reply = response.data.choices?.[0]?.message?.content;
      message.reply(reply || "🧠 I'm blank rn...");
    } catch (err) {
      console.error('ZEX AI error (mention):', err);
      message.reply('⚠️ My brain short-circuited');
    }
  }
});

automod(client);
verifier(client);
logger(client);

client.login(process.env.TOKEN);

// 🌐 Express server to keep bot alive
app.get('/', (_, res) => res.send('Zex Bot is running!'));

app.listen(3000, () => console.log('🌐 Fake server listening on port 3000'));

// 🧠 POST API for external access to AI
app.post('/api/chat', express.json(), async (req, res) => {
  const { prompt } = req.body;
  if (!process.env.OPENROUTER_API_KEY || !prompt) {
    return res.status(400).json({ error: 'Missing prompt or API key.' });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/cypher-alpha:free',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://zex.dortz.zone',
          'X-Title': 'ZEX-Core'
        }
      }
    );
    const reply = response.data.choices?.[0]?.message?.content;
    res.json({ reply });
  } catch (err) {
    console.error('ZEX AI error (API):', err);
    res.status(500).json({ error: 'ZEX failed to think.' });
  }
});