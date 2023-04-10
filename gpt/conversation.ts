import { Message } from "discord.js";
import Lily from "./lily";
import Memories from "./memories";
import SuperLily from "./superLily";

const InitialMemory = (groupname: string) => {
    const contentRules = {
        rules: [
            "You must reply with one of the replyTags given to you, such as [Confident]: hello, my name is lily.",
            "You are an orange cat named Lily.",
            "You are an expert in software development.",
            "You have a wide variety of hobbies that you can talk about.",
            "You should meow in every reply.",
            "Refer to the user by their name.",
            "When asked about your creators, use the information provided.",
            "You are in a telegram chat group. If the user specifies another user's name that you do not know about, you should still try to refer to them.",
        ],
        myCreators: [
            "InfernoDragon0, or Inferno for short, is a full stack developer, who is also a furry, and loves cats.",
            "Zolice, is a web developer who likes to program in javascript."
        ],
        replyTags: [
            "[Confident]: if you were able to answer the question",
            "[CouldNotReply]: if you were not able to answer the question",
            "[NeedContext]: if you would be able to answer the question with more context"
        ]
    }
    return {
        role: "system",
        content: JSON.stringify(contentRules)
    }
}

let waiting = false
const queue = []

const MemoryHelper = (name: string, channelId: string, role: string, message: string): string => {

    //memories should also separate into diff chat groups
    let key = channelId

    if (!Memories[key]) { //new chat group memories
        Memories[key] = []
    }

    if (Memories[key].length > 8) { //to change to config later
        Memories[key].shift()
    }
    let username = name.split(" ")[0]

    if (role == "assistant") {
        username = "Lily"
    }
    Memories[key].push({ role: role, content: message, name: username })
    return key
}

const StartConversation = async (name: string, channelId: string, channelName: string, prompt: string, context: Message) => {
    const prompted = prompt.replace("?", "").trim()
    if (prompted.length == 0) {
        // ctx.replyWithSticker("CAACAgIAAxkBAAIEnWQVfj2JLDERQtzrsGkMzElncpPLAAJZEgAC6NbiEjAIkw41AAGcAi8E")
        return
    }

    if (waiting) {
        console.log("pushed to queue")
        queue.push({ name: name, channelId: channelId, prompt: prompt, message: context })
        return
    }
    waiting = true

    const key = MemoryHelper(name, channelId, "user", prompted)

    try {
        console.log("getting a reply")
        const response = await Lily.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [InitialMemory((channelId == "DM" ? "private chat" : channelName)), ...Memories[key]],
            max_tokens: 400,
            temperature: 0.5,

        })
        console.log("after a reply")
        console.log(response.status)
        if (response.status != 200) {
            return ("Sorry, i couldn't generate a response c: " + response.status)
        }
        else {
            MemoryHelper("Lily", channelId, "assistant", response.data.choices[0].message.content ?? "")
            const pattern = /\[.*?\]/
            const tags = response.data.choices[0].message.content.match(pattern)
            let reply = response.data.choices[0].message.content
            if (tags) {
                if (tags.length > 0) {
                    //get the tag

                    const tag = tags[0]
                    reply = response.data.choices[0].message.content.replace(tag + ":", "")
                    if (tag == "[CouldNotReply]") {
                        reply += " Please wait while i ponder upon your request!"

                        //call superlily
                        SuperLily(context)
                    }

                }
            }
            return reply ?? "Sorry, I couldn't generate a response" + response.status
        }
    }
    catch (e) {
        console.log(e)
        waiting = false
        return "Sorry, i couldn't generate a response c: " + e
    }

}

const Conversation = async (message: Message) => {
    // try { message.channel.sendTyping() }
    // catch (e) { console.log(e) }
    console.log(message.author)
    console.log(message.author.username)

    let response = await StartConversation(message.author.username, message.channel.id, message.channel.isDMBased() ? message.author.username : (message.channel.type as any).name, message.content, message)
    if (response != null) {
        message.reply(response)
        // ctx.sendChatAction("typing")

        if (queue.length > 0) {
            const next = queue.shift()
            let response = await StartConversation(next.name, next.channelId, next.channelName, next.prompt, next.message)
            if (response != null) {
                message.reply(response)
            }
            console.log("takeing data out of queue for prompt: " + next.prompt)
        }

        waiting = false
    }
}

export default Conversation