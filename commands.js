const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = [ { data: new SlashCommandBuilder() .setName("say") .setDescription("Make the bot say something") .addStringOption(option => option.setName("message") .setDescription("Message to say") .setRequired(true) ), async execute(interaction) { if (!interaction.inGuild()) { return interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true }); } if (!interaction.member.permissions.has("ManageMessages")) { return interaction.reply({ content: "❌ You need Manage Messages permission to use this.", ephemeral: true }); }

const msg = interaction.options.getString("message");
  await interaction.reply(msg);
}

},

{ data: new SlashCommandBuilder() .setName("warn") .setDescription("Warn a user") .addUserOption(option => option.setName("user") .setDescription("User to warn") .setRequired(true) ) .addStringOption(option => option.setName("reason") .setDescription("Reason for warning") .setRequired(true) ), async execute(interaction) { if (!interaction.inGuild()) { return interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true }); } if (!interaction.member.permissions.has("ManageMessages")) { return interaction.reply({ content: "❌ You need Manage Messages permission to use this.", ephemeral: true }); }

const user = interaction.options.getUser("user");
  const reason = interaction.options.getString("reason");
  const embed = new EmbedBuilder()
    .setTitle("⚠️ User Warned")
    .addFields(
      { name: "User", value: `<@${user.id}>`, inline: true },
      { name: "Reason", value: reason, inline: true },
      { name: "Moderator", value: `<@${interaction.user.id}>`, inline: true }
    )
    .setColor("Yellow")
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

},

{ data: new SlashCommandBuilder() .setName("kick") .setDescription("Kick a member") .addUserOption(option => option.setName("user") .setDescription("User to kick") .setRequired(true) ) .addStringOption(option => option.setName("reason") .setDescription("Reason for kick") .setRequired(false) ), async execute(interaction) { if (!interaction.inGuild()) { return interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true }); } if (!interaction.member.permissions.has("KickMembers")) { return interaction.reply({ content: "❌ You need Kick Members permission to use this.", ephemeral: true }); }

const user = interaction.options.getUser("user");
  const reason = interaction.options.getString("reason") || "No reason provided";
  const member = interaction.guild.members.cache.get(user.id);

  if (!member) return interaction.reply({ content: "⚠️ Couldn't find that member.", ephemeral: true });

  try {
    await member.kick(reason);
    await interaction.reply(`✅ Kicked <@${user.id}> for: ${reason}`);
  } catch (err) {
    await interaction.reply({ content: `❌ Failed to kick: ${err.message}`, ephemeral: true });
  }
}

},

{ data: new SlashCommandBuilder() .setName("clear") .setDescription("Delete a number of messages") .addIntegerOption(option => option.setName("amount") .setDescription("Number of messages to delete (max 100)") .setRequired(true) ), async execute(interaction) { if (!interaction.inGuild()) { return interaction.reply({ content: "❌ This command can only be used in a server.", ephemeral: true }); } if (!interaction.member.permissions.has("ManageMessages")) { return interaction.reply({ content: "❌ You need Manage Messages permission to use this.", ephemeral: true }); }

const amount = interaction.options.getInteger("amount");
  if (amount > 100 || amount < 1) {
    return interaction.reply({ content: "⚠️ You can delete between 1 and 100 messages only.", ephemeral: true });
  }

  const messages = await interaction.channel.bulkDelete(amount, true).catch(() => null);
  if (!messages) {
    return interaction.reply({ content: "❌ Failed to delete messages. Are they older than 14 days?", ephemeral: true });
  }

  await interaction.reply({ content: `🧹 Deleted ${messages.size} messages!`, ephemeral: true });
}

} ];

