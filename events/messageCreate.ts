import { Message, Client } from "discord.js";
import Conversation from "../gpt/conversation";

const MessageCreateEvent = (message: Message, client: Client) => {
    if(message.author.bot) return

    let codeRequest = ""
    let promptRequest = ""

    if (message.content.startsWith('//')) codeRequest = message.content.replace('//', '')
    if (message.content.startsWith('?')) promptRequest = message.content.replace('?', '')

    if(promptRequest) {
        Conversation(message)
    }
}

export default MessageCreateEvent