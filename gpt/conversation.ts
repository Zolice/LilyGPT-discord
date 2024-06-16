import { Client, Message, TextChannel, EmbedBuilder } from "discord.js";
import Lily from "./lily";
import { Memories, MemoryHelper, InitialMemory } from "./memories";
import { TokensHelper, TokensTotal } from "./tokens"
import axios from 'axios'

let running = false
const queue = []

const Conversation = async (client: Client, message: Message) => {
    // Add the message to queue
    queue.push(message)

    // Check if there is a running thread
    if (running) return
    // Start a new thread
    StartThread(client)
}

const StartThread = async (client: Client) => {
    // Set running to true
    running = true

    while (queue.length > 0) {
        // Get the first message from the queue
        const message = queue.shift()
        if (!message) {
            running = false
            return
        }

        // Process the message
        await ProcessMessage(client, message)
    }

    // Set running to false
    running = false
}

const getFileType = (attachment) => {
    if (attachment.contentType) {
        return attachment.contentType;
    }

    const fileName = attachment.name;
    const extension = fileName.split('.').pop().toLowerCase();

    // Map common extensions to MIME types if needed
    const extensionToMimeType = {
        'txt': 'text/plain',
        'json': 'application/json',
        'js': 'application/javascript',
        'xml': 'application/xml',
        'html': 'text/html',
        'css': 'text/css',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        // Add more mappings as needed
    };

    return extensionToMimeType[extension] || `application/octet-stream`;
};

const ProcessMessage = async (client: Client, message: Message) => {
    // Remove the prefix
    const prompt = message.content.replace("?", "").trim()
    const attachments = message.attachments
    const content = []

    // Check if the message is empty
    if (prompt.length == 0 && attachments.size == 0) {
        message.reply("Please provide a prompt.")
        return
    }

    // Send typing status to the channel
    // (message.channel as any).sendTyping()
    message.channel.sendTyping()

    // Add message as 1st content
    content.push({ type: 'text', text: prompt })

    // Process attachments
    Promise.all(attachments.map(async attachment => {
        {
            console.log(attachment)
            const fileType = getFileType(attachment)
            const validTypes = ['text/plain', 'application/json', 'application/javascript', 'application/xml', 'text/html', 'text/css', 'text/javascript', 'text/plain; charset=utf-8'];
            const imageTypes = ['image/jpeg', 'image/png']; // Add more image types if needed

            const embed = new EmbedBuilder()
                .setFooter({ text: message.author.displayName, iconURL: message.author.avatarURL() });

            if (validTypes.includes(fileType) || validTypes.includes(`text/${fileType}`)) {
                try {
                    const response = await axios.get(attachment.url);
                    const fileContent = response.data;

                    // Update Embed
                    embed.setTitle(`Attached ${attachment.name}`)
                        .setDescription(`${fileType}`)
                        .setColor('#00FF00'); // Green

                    // console.log('File content:', fileContent);

                    // Update content
                    content.push({ type: 'text', text: `${attachment.name} (${fileType}): \n${fileContent}` });
                    console.log('File: ' + attachment.name)
                } catch (error) {
                    console.error('Error fetching attachment:', error);
                    embed.setTitle(`Failed to fetch ${attachment.name}`)
                        .setDescription(`${fileType}`)
                        .setColor('#FF0000'); // Red
                }
            } else if (imageTypes.includes(fileType)) {
                // Handle image attachments
                embed.setTitle(`Attached ${attachment.name}`)
                    .setImage(attachment.url)
                    .setColor('#00FF00'); // Green

                console.log('Image: ' + attachment.name)

                content.push({ type: 'image_url', image_url: { url: attachment.url } });
            } else {
                embed.setTitle(`Unsupported file type ${attachment.name}`)
                    .setDescription(`${fileType}`)
                    .setColor('#FFA500'); // Orange
            }

            // Send the embed
            await message.channel.send({ embeds: [embed] });

            // Continue Typing
            message.channel.sendTyping();
        }
    })).then(async () => {
        // Get the memory key
        const key = MemoryHelper(message, "user", content)

        try {
            console.log([InitialMemory(), ...Memories[key]])
            const response = await Lily.chat.completions.create({
                model: "gpt-4o",
                messages: [InitialMemory(), ...Memories[key]],
                max_tokens: 1500,
                temperature: 0.5,

            })

            // Update tokens
            TokensHelper(message, response.usage.total_tokens)
            // console.log(TokensTotal())

            // Update memory
            MemoryHelper(message, "assistant", [{ text: response.choices[0].message.content ?? "" }])

            // Send the response
            RespondToMessage(client, message, response.choices[0].message.content ?? "", 2000)
        }
        catch (e) {
            console.error(e)
            message.reply("There was an error while processing your request.")
        }
    })

}

const RespondToMessage = (client: Client, message: Message, reply: string, charLimit: number) => {
    if (reply.length <= charLimit) {
        message.reply(reply)
        return
    }

    let result = [];
    let startIndex = 0;

    while (startIndex < reply.length) {
        let endIndex = startIndex + charLimit;
        result.push(reply.substring(startIndex, endIndex));
        startIndex = endIndex;
    }

    message.reply(result[0])
    for (let i = 1; i < result.length; i++) {
        (client.channels.cache.get(message.channel.id) as TextChannel).send(result[i])
    }
}

export default Conversation