const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('art')
        .setDescription('Generate art using Dall-E')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The description of the art to generate')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        console.log("art command executed: " + interaction.options.getString('message') + " by " + interaction.user.username + " in " + interaction.channel.name)
        await interaction.reply({ content: 'Generating your Art!' })

        let img = await client.openai.createImage(
            {
                prompt: interaction.options.getString('message'),
                n:1,
                size: "256x256"
            },
        )
        let image_url = img.data['data'][0]['url']

        interaction.channel.send("Here is your `" + interaction.options.getString('message') + "`!")
        interaction.channel.send(image_url)
        
    },
}