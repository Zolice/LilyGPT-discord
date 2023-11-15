import { AttachmentBuilder, ChannelType, Client, Message } from "discord.js";
import Lily from "./lily";
import Memories from "./memories";
import Conversation from "./conversation";
import path from "path";
import fs from "fs";
import { VoiceConnectionStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";

const MemoryHelper = (message: Message, role: string, prompt: string): string => {

    //memories should also separate into diff chat groups
    let key = message.channel.isDMBased() ? message.author.id : message.channel.id

    if (!Memories[key]) { //new chat group memories
        Memories[key] = []
    }

    if (Memories[key].length > 8) { //to change to config later
        Memories[key].shift()
    }
    // let username = (message.member.displayName as any).replaceAll(" ", "")
    let username = (message.author.username as any).replaceAll(" ", "")

    if (role == "assistant") {
        username = "Lily"
    }
    Memories[key].push({ role: role, content: prompt, name: username })
    return key
}

const LilySpeak = async (client: Client, message: Message) => {
    const prompt: string = message.content
    let result = null

    const prompted = prompt.replace("^", "").trim()
    if (prompted.length == 0) {
        // message.replyWithSticker("CAACAgIAAxkBAAIEnWQVfj2JLDERQtzrsGkMzElncpPLAAJZEgAC6NbiEjAIkw41AAGcAi8E")
        return
    }

    const key = MemoryHelper(message, "user", prompted)

    try {
        console.log("getting a reply")
        const response = await Conversation(client, message)
        console.log("after a reply")

        //TEMP FILE to store audio
        const speechFile = path.resolve("./tempSpeech.mp3");
        
        //generate using TTS openai
        let audioReply = await Lily.audio.speech.create({
            model: "tts-1-hd",
            input: response,
            voice: "fable",
        })

        //SEND AUDIO as a file
        const buffer = Buffer.from(await audioReply.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);

        let reply = response
        result = reply

        let attachment = new AttachmentBuilder(speechFile, {name: "lilywashere.mp3"})
        await message.reply({files: [attachment], content: reply})
        
        //JOIN VC and den talk
        const channel = message.guild.channels.cache.find(channel => channel.name == "lily-speaks")

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Lily will meow now!');
            const audioPlayer = createAudioPlayer();
            const resource = createAudioResource(speechFile);
            const subscription = connection.subscribe(audioPlayer);

            audioPlayer.play(resource);

            //leave after it is done playing
            audioPlayer.on('stateChange', (oldState, newState) => {
                if (newState.status === 'idle') {
                    console.log('Lily is done meowing!');
                    connection.destroy();
                }
            });

        });

    }
    catch (e) {
        console.log(e)
        message.reply("Sorry, i couldn't generate a response c: " + e)
    }

    return result

}

export default Conversation