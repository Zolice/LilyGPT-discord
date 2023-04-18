import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Client } from 'discord.js'
import GenerateArt from '../gpt/generateArt'
import ConversationSingle from '../gpt/conversationSingle'

export const artData = new SlashCommandBuilder()
    .setName('art')
    .setDescription('Generate art using Dall-E')
    .addStringOption(option =>
        option.setName('request')
            .setDescription('The description of the art to generate')
            .setRequired(true)
    )

export const artExecute = async (interaction: CommandInteraction, client: Client) => {
    // await interaction.reply({ content: 'Generating your Art!' })
    let request = interaction.options.get('request').value as string
    if (request.length <= 0) {
        interaction.reply({ content: "Tell me what you would like to draw, with /art <search term>", ephemeral: true })
        return
    }

    GenerateArt(request, interaction.user.username).then(async (response: string) => {
        if (response.startsWith("Sorry")) {
            interaction.reply(response)
            return
        }

        let quote = await ConversationSingle(`I have drawn a ${request}, write a short quote about it.`)
        await interaction.reply(`${quote}\n${response}`)
    })

}