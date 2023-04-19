import { Message, Client } from "discord.js";
import Conversation from "../gpt/conversation";
import SuperLily from "../gpt/superLily";

const MessageCreateEvent = (message: Message, client: Client) => {
    if(message.author.bot) return

    let messageCommand = null
    let promptRequest = ""
    let superLilyRequest = ""

    if (message.content.startsWith('/')) messageCommand = message
    if (message.content.startsWith('?')) promptRequest = message.content.replace('?', '')
    if (message.content.startsWith('!')) superLilyRequest = message.content.replace('!', '')

    if(promptRequest) {
        Conversation(client, message)
    }
    if(superLilyRequest) {
        SuperLily(client, message)
    }
    if(messageCommand) {
        
    }
}

export default MessageCreateEvent