const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, defaultModel, openaiKey, clientId } = require('./config.json');
const { Configuration, OpenAIApi } = require('openai');

// Initialize the Discord client
const client = new Client({
  intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.DirectMessages,
	],
});

// Load commands.
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Initialize OpenAI/ChatGPT.
var modelId = defaultModel;

const configuration = new Configuration({
  apiKey: openaiKey,
});
const openai = new OpenAIApi(configuration);


// Process commands.
client.on("interactionCreate", async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.on('ready', () => {
  // Set the bot's presence
  client.user.setPresence({ activity: { name: 'Talking with ChatGPT' } });
  console.log("Logged in");
});

// Log in to Discord using the client ID and secret
client.login(token);