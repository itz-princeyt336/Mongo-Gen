const { SlashCommandBuilder } = require('@discordjs/builders');
const { MongoClient, MongoError } = require('mongodb');
const config = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mongo-status')
    .setDescription('Check the status of a MongoDB')
    .addStringOption(option =>
      option.setName('mongo-url')
        .setDescription('MongoDB Connection URL')
        .setRequired(true)),
  async execute(interaction) {
    const mongoURL = interaction.options.getString('mongo-url');

    // Check if the MongoDB URL matches the specified structure
    const expectedUrlStructure = /^(mongodb\+srv:\/\/)([a-zA-Z0-9_-]+):([a-zA-Z0-9_-]+)@([a-zA-Z0-9.-]+)\/?(\?.*)?$/;

    if (!expectedUrlStructure.test(mongoURL)) {
      return interaction.reply({
        content: "Please make sure it is a valid MongoDB connection URL with the correct username and password.",
        ephemeral: true,
      });
    }

    // Connect to the provided MongoDB URL to check its status
    const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
      await client.connect();
      const dbInfo = await client.db().admin().ping();

      const onlineEmbed = {
        title: "MongoDB Status Checker",
        description: `The MongoDB at ${mongoURL} is online. MongoDB Version: ${dbInfo.version}.`,
        color: 0x00FF00, // Green color
        footer: {
          text: "Made By QC Devs",
          icon_url: interaction.client.user.avatarURL(), // Use the bot's avatar URL
        },
      };

      await interaction.reply({
        embeds: [onlineEmbed],
        ephemeral: true,
      });
    } catch (error) {
      if (error instanceof MongoError && error.codeName === 'AtlasError' && error.ok === 0) {
        // Suppress logging of sensitive authentication failure errors
        const offlineEmbed = {
          title: "MongoDB Status Checker",
          description: 'MongoDB is offline.',
          color: 0xFF0000, // Red color
          footer: {
            text: "Made By QC Devs",
            icon_url: interaction.client.user.avatarURL(), // Use the bot's avatar URL
          },
        };

        await interaction.reply({
          embeds: [offlineEmbed],
          ephemeral: true,
        });
      } else {
        // Log other non-sensitive errors
        console.error(error);
        await interaction.reply({
          content: 'An error occurred while checking the MongoDB status.',
          ephemeral: true,
        });
      }
    } finally {
      await client.close();
    }
  },
};
