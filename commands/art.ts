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
    interaction.reply("Grabbing Crayons...")
    interaction.channel.sendTyping()


    GenerateArt(request, interaction.user.username).then(async (response: string) => {
        if (response.startsWith("Sorry")) {
            interaction.channel.send(response)
            return
        }

        let quote = await ConversationSingle(`I have drawn a ${request}, write a short quote about it.`)

        let name = (interaction.member as GuildMember).displayName

        let embed = new EmbedBuilder()
            .setColor("Random")
            // .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setAuthor({ name: name, iconURL: interaction.user.avatarURL() })
            .setTitle(`${request}`)
            .setDescription(quote)
            .setImage(response)
            .setFooter({ text: `Provided by ${client.user.username} /art`, iconURL: client.user.avatarURL() })


        // await interaction.editReply(`${quote}\n${response}`)
        await interaction.editReply({ content: "", embeds: [embed] })
    })

}