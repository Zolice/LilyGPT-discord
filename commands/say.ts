import { SlashCommandBuilder } from '@discordjs/builders'
import CheckAdmin from '../functions/checkAdmin'
import { CommandInteraction, Client } from 'discord.js'

export const sayData = new SlashCommandBuilder()
    .setName('say')
    .setDescription('Admin only`')
    .addStringOption(option =>
        option.setName('message')
            .setDescription('The message to send')
            .setRequired(true)
    )

export const sayExecute = async (interaction: CommandInteraction, client: Client) => {
    console.log("Say command executed: " + interaction.options.get('message').value + " by " + interaction.user.username + " in " + interaction.channel.name)

    if (!CheckAdmin(interaction.guildId, interaction.user.id, client)) return interaction.reply({ content: 'Error: Administrative rights required.', ephemeral: true })

    interaction.channel.send(interaction.options.get('message').value as string)
    await interaction.reply({ content: 'Sent!', ephemeral: true })
}