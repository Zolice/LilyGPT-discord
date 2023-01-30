const fs = require("fs")
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearcontext')
        .setDescription('Clear the context for you/this channel.'),
    async execute(interaction, client) {
        client.config.discord.registeredServers.forEach(server => {
            server.openAiChannelIDs.general.forEach(channelId => {
                if (channelId == interaction.channelId) {
                    client.context.generalChat[interaction.user.id] = []
                }
            })
            server.openAiChannelIDs.multiplayer.forEach(channelId => {
                if (channelId == interaction.channelId) {
                    client.context.multiplayerChat[interaction.channelId] = []
                }
            })
        })

        console.log(client.context)

        fs.writeFileSync(`./context.json`, JSON.stringify(client.context, null, 4), err => {
            if (err) console.log(err)
        })

        await interaction.reply('Context has been cleared. You can now start a new conversation.');
    },
}