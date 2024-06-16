import { SlashCommandBuilder } from '@discordjs/builders'
import { Memories } from '../gpt/memories'
import { Client, CommandInteraction } from 'discord.js'

export const clearData = new SlashCommandBuilder()
    .setName('clearcontext')
    .setDescription('Clear the context for you/this channel.')

export const clearExecute = async (interaction: CommandInteraction, client: Client) => {
    Memories[interaction.channel.isDMBased() ? interaction.user.id : interaction.channel.id] = []
    await interaction.reply({ content: 'Context has been cleared.' })
}