const { Client, Intents } = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { join } = require('path');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
    // Add other necessary intents
  ],
});

client.commands = new Map(); // Initialize the commands map

const config = require("./config.json");

if (!config.token)
  throw new Error("Please enter a token in config.json ");
if (!config.private_key)
  throw new Error("Please enter a private key in the config.json");
if (!config.public_key)
  throw new Error("Please enter a public key in the config.json");
if (!config.org_Id)
  throw new Error("Please enter an orgId in the config.json");

const commands = [];
const commandFiles = fs.readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(join(__dirname, 'commands', file));
 commands.push(command.data);
  client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands globally.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setStatus('online');
client.user.setActivity(`Ghost Planet`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.login(config.token);
