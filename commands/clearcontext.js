const fs = require("fs")
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearcontext')
        .setDescription('Clear the context for you/this channel.'),
    async execute(interaction, client) {
        console.log("Clear Context command executed by " + interaction.user.username + " in " + interaction.channel.name)
        let response = "This channel has not been registered yet."

        if (client.config.discord.registeredServers[interaction.guildId]) {
            client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.forEach(channelId => {
                if (channelId == interaction.channelId) {
                    client.context.generalChat[interaction.user.id] = []
                    response = { content: 'Context has been cleared for yourself. You can now start a new conversation.', ephemeral: true }
                }
            })
            client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.forEach(channelId => {
                if (channelId == interaction.channelId) {
                    client.context.multiplayerChat[interaction.channelId] = []
                    response = 'Context has been cleared for this channel. You can now start a new conversation.'
                }
            })
        }

        interaction.reply(response)

        fs.writeFileSync(`./context.json`, JSON.stringify(client.context, null, 4), err => {
            if (err) console.log(err)
        })
    },
}