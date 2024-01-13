const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAll } = require("../functions/createDb");
const config = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('custom-gen')
    .setDescription('Generate a MongoDB')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Your desired username for the MongoDB')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('password')
        .setDescription('Your desired password for the MongoDB')
        .setRequired(true)),
  async execute(interaction) {
    const user = interaction.user;
    const username = interaction.options.getString('username');
    const password = interaction.options.getString('password');

    // Reply in the channel with a non-ephemeral message
    interaction.reply("Check your DMs ;)");

    const embed = {
      title: "MongoDB URL Generator",
      description: "",
      color: 0x00FF00, // Green color
      footer: {
        text: "Made By Ghost Planet",
        icon_url: interaction.client.user.avatarURL(), // Use the bot's avatar URL
      },
    };

    const authToken = config.private_key;
    const public_key = config.public_key;
    const ipWhitelist = "0.0.0.0";

    // Create the database
    user.send("Creating your MongoDB. This may take some time...");

    let mongo;
    try {
      mongo = await createAll(
        username,
        authToken,
        public_key,
        ipWhitelist,
        username,
        password
      );

      embed.description = `**Here is your database:** ${mongo}`;
      // Send the MongoDB URL in the user's DMs
      user.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      user.send("There was an error while creating your MongoDB. Please try again.");
    }
  },
};
