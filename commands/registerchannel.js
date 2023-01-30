const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('registerchannel')
        .setDescription('Register/Unregister the current channel for the bot to respond to.`')
        .addStringOption(option =>
            option
                .setName('channeltype')
                .setDescription('Channel Type')
                .addChoices(
                    { name: 'Open AI General', value: 'Open AI General' },
                    { name: 'Open AI Multiplayer', value: 'Open AI Multiplayer' }
                )
                .setRequired(true)
        ).addStringOption(option =>
            option
                .setName('register')
                .setDescription('Register/Unregister the current channel for the bot to respond to. Default: Register')
                .addChoices(
                    { name: 'Register', value: 'Register' },
                    { name: 'Unregister', value: 'Unregister' }
                )
        ),
    async execute(interaction, client) {
        var channelType = interaction.options.getString('channeltype')
        var register = interaction.options.options.getString('register')

        if (client.config.discord.registeredServers[interaction.guildId]) {
            client.config.discord.registeredServers[interaction.guildId] = {
                "serverName": interaction.guild.name,
                "serverID": interaction.guildId,
                "openAiChannelIDs": {
                    "general": [],
                    "multiplayer": []
                }
            }
        }

        if (!register) register = "Register"

        // if (register == 'Register') {
        //     switch (channelType) {
        //         case 'Open AI General':
        //             if (client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.includes(interaction.channelId)) {


        if (interaction.options.getString('register') == 'Register') {
            switch (interaction.options.getString('channeltype')) {
                case 'Open AI General':
                    if (client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.includes(interaction.channelId)) {
                        await interaction.reply({ content: `This channel is registered for Open AI General.`, ephemeral: true });
                        return;
                    }
                    else {
                        client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.push(interaction.channelId)
                        await interaction.reply({ content: `This channel is now registered for Open AI General.`, ephemeral: true });
                    }
                    break;
                case 'Open AI Multiplayer':
                    if (client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.includes(interaction.channelId)) {
                        await interaction.reply({ content: `This channel is registered for Open AI Multiplayer.`, ephemeral: true });
                        return;
                    }
                    else {
                        client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.push(interaction.channelId)
                        await interaction.reply({ content: `This channel is now registered for Open AI Multiplayer.`, ephemeral: true });
                    }
                    break;
            }
        }
        else {
            switch (interaction.options.getString('channeltype')) {
                case 'Open AI General':
                    if (!client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.includes(interaction.channelId)) {
                        await interaction.reply({ content: `This channel is not registered for Open AI General.`, ephemeral: true });
                        return;
                    }
                    else {
                        client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general = client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.splice(client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.general.indexOf(interaction.channelId), 1);
                        await interaction.reply({ content: `This channel is now unregistered for Open AI General.`, ephemeral: true });
                    }
                    break;
                case 'Open AI Multiplayer':
                    if (!client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.includes(interaction.channelId)) {
                        await interaction.reply({ content: `This channel is not registered for Open AI Multiplayer.`, ephemeral: true });
                        return;
                    }
                    else {
                        client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer = client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.splice(client.config.discord.registeredServers[interaction.guildId].openAiChannelIDs.multiplayer.indexOf(interaction.channelId), 1);
                        await interaction.reply({ content: `This channel is now unregistered for Open AI Multiplayer.`, ephemeral: true });
                    }
                    break;
            }
        }


    },
}