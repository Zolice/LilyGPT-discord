const fs = require('fs')
const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('registerchannel')
        .setDescription('Register/Unregister the current channel for the bot to respond to.`')
        .addBooleanOption(option =>
            option
                .setName('register')
                .setDescription('Register/Unregister the current channel for the bot to respond to.')
                // .addChoices(
                //     { name: 'Register', value: true },
                //     { name: 'Unregister', value: false }
                // )
                .setRequired(true)
        ).addStringOption(option =>
            option
                .setName('channeltype')
                .setDescription('Channel Type')
                .addChoices(
                    { name: 'Open AI General', value: 'general' },
                    { name: 'Open AI Multiplayer', value: 'multiplayer' }
                )
        ),
    async execute(interaction, client) {
        console.log("Register Channel command executed by " + interaction.user.username + " in " + interaction.channel.name)

        if (!client.CheckIfUserIsAdmin(interaction.guildId, interaction.user.id)) return interaction.reply({ content: 'Error: Administrative rights required.', ephemeral: true })

        var channelUnregistered = false
        if (interaction.options.getBoolean('register')) {
            // register server to config
            if (!client.config.discord.registeredServers[interaction.guildId]) {
                client.config.discord.registeredServers[interaction.guildId] = {
                    "serverName": interaction.guild.name,
                    "openAiChannelIDs": {
                        "general": [],
                        "multiplayer": []
                    }
                }
            }

            // Check if channel is already registered
            client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.forEach(channelId => {
                if (channelId == interaction.channelId) return interaction.reply({ content: `Error: This channel is already registered for Open AI General.`, ephemeral: true })
            })

            client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.forEach(channelId => {
                if (channelId == interaction.channelId) return interaction.reply({ content: `Error: This channel is already registered for Open AI Multiplayer.`, ephemeral: true })
            })

            switch (interaction.options.getString('channeltype')) {
                case 'general':
                    client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.push(interaction.channelId)
                    interaction.reply("Registered channel " + interaction.channel.name + " for Open AI General")
                    console.log(client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs)
                    break
                case 'multiplayer':
                    client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.push(interaction.channelId)
                    interaction.reply("Registered channel " + interaction.channel.name + " for Open AI Multiplayer")
                    break
                default:
                    interaction.reply("Error: Invalid channel type.")
            }
            channelUnregistered = true
        }
        else {
            // check if server registered
            if (!client.config.discord.registeredServers[interaction.guildId]) return interaction.reply({ content: `Error: This server is not registered.`, ephemeral: true })

            // remove from config
            client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.forEach((channelId, index) => {
                if (channelId == interaction.channelId) {
                    client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.splice(index, 1)
                    interaction.reply("Unregistered channel " + interaction.channel.name + " for Open AI General successfully.")
                    channelUnregistered = true
                }
            })
            client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.forEach((channelId, index) => {
                if (channelId == interaction.channelId) {
                    client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.splice(index, 1)
                    interaction.reply("Unregistered channel " + interaction.channel.name + " for Open AI Multiplayer successfully.")
                    channelUnregistered = true
                }
            })
        }

        if (!channelUnregistered) return interaction.reply({ content: `Error: This channel is not registered.`, ephemeral: true })

        fs.writeFileSync(`./config.json`, JSON.stringify(client.config, null, 4), err => {
            if (err) console.log(err)
        })
    }
}