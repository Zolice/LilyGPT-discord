import InteractionCreateEvent from "./interactionCreate";
import MessageCreateEvent from "./messageCreate";
import ReadyEvent from "./readyEvent";
import { Message, Client, Interaction } from "discord.js";

const eventManager = (client: Client) => {
    client.on('ready', () => {
        ReadyEvent(client)
    })

    client.on('messageCreate', (message: Message) => {
        MessageCreateEvent(message, client)
    })

    client.on('interactionCreate', (interaction: Interaction) => {
        InteractionCreateEvent(interaction, client)
    })

}

export default eventManager