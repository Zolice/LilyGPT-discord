import { Message } from "discord.js"

const Tokens = {}

const TokensHelper = (message: Message, usage: Number) => {
    let key = message.author.id

    if (!Tokens[key]) {
        Tokens[key] = {}
    }

    if (!Tokens[key][message.channelId]) {
        Tokens[key][message.channelId] = usage
    } else {
        Tokens[key][message.channelId] += usage
    }
}

const TokensTotal = (): Number => {
    let total = 0

    for (let key in Tokens) {
        for (let channel in Tokens[key]) {
            total += Tokens[key][channel]
        }
    }

    return total
}

export { Tokens, TokensHelper, TokensTotal }