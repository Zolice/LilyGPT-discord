import { Client, Message } from "discord.js";
import Lily from "./lily";
import Memories from "./memories";
import SuperLily from "./superLily";

const InitialMemory = () => {
    const contentRules = {
        rules: [
            "You must reply with one of the replyTags given to you, such as [Confident]: hello, my name is lily.",
            "You are an orange cat named Lily.",
            "You are an expert in software development.",
            "You have a wide variety of hobbies that you can talk about.",
            "You should meow in every reply.",
            "Refer to the user by their name.",
            "When asked about your creators, use the information provided.",
            "You are in a discord chat group. If the user specifies another user's name that you do not know about, you should still try to refer to them.",
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

const MemoryHelper = (message: Message, role: string, prompt: string): string => {

    //memories should also separate into diff chat groups
    let key = message.channel.isDMBased() ? message.author.id : message.channel.id

    if (!Memories[key]) { //new chat group memories
        Memories[key] = []
    }

    if (Memories[key].length > 8) { //to change to config later
        Memories[key].shift()
    }
    let username = (message.member.displayName as any).replaceAll(" ", "")

    if (role == "assistant") {
        username = "Lily"
    }
    Memories[key].push({ role: role, content: prompt, name: username })
    return key
}

const Conversation = async (client: Client, message: Message) => {
    const prompt: string = message.content

    if (waiting) {
        console.log("pushed to queue")
        queue.push(message)
        return
    }
    waiting = true

    const prompted = prompt.replace("?", "").trim()
    if (prompted.length == 0) {
        // message.replyWithSticker("CAACAgIAAxkBAAIEnWQVfj2JLDERQtzrsGkMzElncpPLAAJZEgAC6NbiEjAIkw41AAGcAi8E")
        return
    }
    message.channel.sendTyping()

    const key = MemoryHelper(message, "user", prompted)

    try {
        console.log("getting a reply")
        console.log([InitialMemory(), ...Memories[key]])
        const response = await Lily.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [InitialMemory(), ...Memories[key]],
            max_tokens: 400,
            temperature: 0.5,

        })
        console.log("after a reply")
        console.log(response.status)
        if (response.status != 200) {
            message.reply("Sorry, i couldn't generate a response c: " + response.status)
        }
        else {
            MemoryHelper(message, "assistant", response.data.choices[0].message.content ?? "")
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
                        SuperLily(client, message)
                    }

                }
            }


            message.reply(reply ?? "Sorry, i couldn't generate a response :c" + response.status)
        }

        waiting = false

        if (queue.length > 0) {
            const next = queue.shift()
            Conversation(client, next)
            console.log("takeing data out of queue for prompt: " + next.content)
        }
    }
    catch (e) {
        console.log(e)
        message.reply("Sorry, i couldn't generate a response c: " + e)
        waiting = false
    }

}

export default Conversation