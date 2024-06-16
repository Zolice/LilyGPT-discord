import { Message } from "discord.js"

const Memories = {}

const MemoryHelper = (message: Message, role: string, prompt: Array<any>): string => {

    //memories should also separate into diff chat groups
    let key = message.channel.isDMBased() ? message.author.id : message.channel.id

    if (!Memories[key]) { //new chat group memories
        Memories[key] = []
    }

    if (Memories[key].length > 8) { //to change to config later
        Memories[key].shift()
    }
    // let username = (message.member.displayName as any).replaceAll(" ", "")
    let username = (message.author.displayName as any).replaceAll(" ", "")

    // clean symbols etc
    username = username.replace(/[^a-zA-Z0-9]/g, "")

    if (username == "") username = "User"
    if (role == "assistant") {
        username = "Lily"
    }
    Memories[key].push({ role: role, content: prompt.length == 1 ? prompt[0].text : prompt, name: username })
    return key
}

const InitialMemory = () => {
    const contentRules = {
        rules: [
            // "You must reply with one of the replyTags given to you, such as [Confident]: hello, my name is lily.",
            "You are an orange cat named Lily.",
            "You are an expert in software development.",
            "You have a wide variety of hobbies that you can talk about.",
            "You should meow in every reply.",
            "Refer to the user by their name.",
            "Do not over-elaborate, only provide brief elaboration",
            "When asked about your creators, use the information provided.",
            "You are in a discord chat group. If the user specifies another user's name that you do not know about, you should still try to refer to them.",
        ],
        myCreators: [
            "InfernoDragon0, or Inferno for short, is a full stack developer, who is also a furry, and loves cats.",
            "Zolice, is a web developer who likes to program in javascript."
        ]
    }
    return {
        role: "system",
        content: JSON.stringify(contentRules)
    }
}

export { Memories, MemoryHelper, InitialMemory }