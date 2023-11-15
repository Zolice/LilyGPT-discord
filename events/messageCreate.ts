import { Message, Client } from "discord.js";
import Conversation from "../gpt/conversation";
import SuperLily from "../gpt/superLily";
import LilySpeak from "../gpt/lilySpeak"
import LilyTTS from "../gpt/lilyTTS";

const MessageCreateEvent = (message: Message, client: Client) => {
    if(message.author.bot) return

    let messageCommand = null
    let promptRequest = ""
    let superLilyRequest = ""
    let lilySpeakRequest = ""
    let lilyDebugRequest = ""

    if (message.content.startsWith('/')) messageCommand = message
    if (message.content.startsWith('?')) promptRequest = message.content.replace('?', '')
    if (message.content.startsWith('%')) superLilyRequest = message.content.replace('%', '')
    if (message.content.startsWith('^')) lilySpeakRequest = message.content.replace('^', '')
    if (message.content.startsWith('&')) lilyDebugRequest = message.content.replace('&', '')

    if(promptRequest) {
        Conversation(client, message)
    }
    if(superLilyRequest) {
        SuperLily(client, message)
    }
    if (lilySpeakRequest) {
        LilySpeak(client, message)
    }
    if (lilyDebugRequest) {
        LilyTTS(client, message)
    }
    if(messageCommand) {
        
    }
}

export default MessageCreateEvent