const { SlashCommandBuilder } = require('discord.js');
const { openaiKey, defaultModel } = require('./../config.json');
const { Configuration, OpenAIApi } = require('openai');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('chatgpt')
		.setDescription('Queries ChatGPT')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The input to send to ChatGPT')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('model')
				.setDescription('The ChatGPT model to use')
				.setRequired(false)
				.addChoices(
					{ name: 'text-davinci-003', value: 'text-davinci-003' },
					{ name: 'text-curie-001', value: 'text-curie-001' },
					{ name: 'text-babbage-001', value: 'text-babbage-001' },
					{ name: 'text-ada-001', value: 'text-ada-001' },
				)),
	async execute(interaction) {
		const configuration = new Configuration({
		  apiKey: openaiKey,
		});
		const openai = new OpenAIApi(configuration);
		await interaction.deferReply();

		console.log("Making OpenAI request...");
		message = interaction.options.getString('input')
		model = interaction.options.getString('model') ?? defaultModel;
		openai.createCompletion({
			model: model,
			prompt: message,
			max_tokens: 2000,
		  })
		  .then(response => {
			console.log(response.data);
			interaction.editReply(response.data.choices[0].text);
		  });
	},
};
