import { AttachmentBuilder, ChannelType, Client, Message } from "discord.js";
import Lily from "./lily";
import Conversation from "./conversation";
import path from "path";
import fs from "fs";
import { VoiceConnectionStatus, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";

const LilyTTS = async (client: Client, message: Message) => {
    const prompt: string = message.content
    let result = null

    const prompted = prompt.replace("&", "").trim()
    if (prompted.length == 0) {
        // message.replyWithSticker("CAACAgIAAxkBAAIEnWQVfj2JLDERQtzrsGkMzElncpPLAAJZEgAC6NbiEjAIkw41AAGcAi8E")
        return
    }
    try {
        const speechFile = path.resolve("./tempSpeech.mp3");    

        let audioReply = await Lily.audio.speech.create({
            model: "tts-1-hd",
            input: prompted,
            voice: "fable",
        })

        //SEND AUDIO as a file
        const buffer = Buffer.from(await audioReply.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);
        //JOIN VC and den talk
        if (!message.member.voice.channel) {
            return message.reply('You need to join a voice channel first!');
        }
        
        const channel = message.member.voice.channel

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

            let attachment = new AttachmentBuilder(speechFile, {name: "lilywashere.mp3"})
            message.reply({files: [attachment], content: "Disclaimer: This voice is generated by AI."})

        });

    }
    catch (e) {
        console.log(e)
        message.reply("Sorry, i couldn't generate a response c: " + e)
    }

    return result

}

export default LilyTTS