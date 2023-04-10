import { Client, Interaction } from "discord.js";
import { Commands } from "../commands/commandManager"

const InteractionCreateEvent = async (interaction: Interaction, client: Client) => {
    if (!interaction.isCommand()) return

    const command = Commands.get(interaction.commandName)

    if (!command) return
    try {
        command(interaction, client)
    } catch (err) {
        console.error(err)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
}

export default InteractionCreateEvent