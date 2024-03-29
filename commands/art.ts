import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Client, EmbedBuilder, GuildMember } from 'discord.js'
import GenerateArt from '../gpt/generateArt'
import ConversationSingle from '../gpt/conversationSingle'

export const artData = new SlashCommandBuilder()
    .setName('art')
    .setDescription('Generate art using Dall-E')
    .addStringOption(option =>
        option.setName('message')
            .setDescription('The description of the art to generate')
            .setRequired(true)
    )

export const artExecute = async (interaction: CommandInteraction, client: Client) => {
    // await interaction.reply({ content: 'Generating your Art!' })
    let request = interaction.options.get('message').value as string
    if (request.length <= 0) {
        interaction.reply({ content: "Tell me what you would like to draw, with /art <search term>", ephemeral: true })
        return
    }
    await interaction.reply("Grabbing Crayons...");
    
    (interaction.channel as any).sendTyping()


    GenerateArt(request, interaction.user.username).then(async (response: string) => {
        if (response.startsWith("Sorry")) {
            (interaction.channel as any).send(response)
            return
        }

        let name = (interaction.member as GuildMember).displayName
        let embed = new EmbedBuilder()
            .setColor("Random")
            // .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setAuthor({ name: name, iconURL: interaction.user.avatarURL() })
            .setTitle(`${request}`)
            .setImage(response)
            .setFooter({ text: `Provided by ${client.user.username} /art`, iconURL: client.user.avatarURL() })
            .setTimestamp()
        await interaction.editReply({ content: "", embeds: [embed] })

        let quote = await ConversationSingle(`I have drawn a ${request}, write a short quote about it.`)
        if (quote.startsWith("Sorry, i couldn't generate a response c: ")) {
            return
        }
        embed.setDescription(quote)
        await interaction.editReply({ content: "", embeds: [embed] })

    })

}