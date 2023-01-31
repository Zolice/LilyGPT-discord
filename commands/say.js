const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Admin only`')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        console.log("Say command executed: " + interaction.options.getString('message') + " by " + interaction.user.username + " in " + interaction.channel.name)

        if(!client.CheckIfUserIsAdmin(interaction.guildId, interaction.user.id)) return interaction.reply({ content: 'Error: Administrative rights required.', ephemeral: true })
        
        interaction.channel.send(interaction.options.getString('message'))
        await interaction.reply({ content: 'Sent!', ephemeral: true })
    },
}