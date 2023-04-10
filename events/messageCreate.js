module.exports = {
    name: 'messageCreate',
    async execute(message, client, fs) {
        var codeRequest = false
        var promptRequest = false
        var context
        var type

        if (message.content.startsWith('//')) codeRequest = message.content.replace('//', '')
        if (message.content.startsWith('?')) promptRequest = message.content.replace('?', '')

        if (codeRequest || promptRequest) {
            if (client.config.discord.registeredServers[message.guildId]) {
                client.config.discord.registeredServers[message.guildId].openAiChannelIDs.general.forEach(channelId => {
                    if (channelId == message.channelId) {
                        type = "general"
                        // Check for Context
                        if (!client.context.generalChat[message.author.id]) {
                            context = []
                        } else {
                            context = client.context.generalChat[message.author.id]
                        }
                    }
                })

                client.config.discord.registeredServers[message.guildId].openAiChannelIDs.multiplayer.forEach(channelId => {
                    if (channelId == message.channelId) {
                        type = "multiplayer"
                        // Check for Context
                        if (!client.context.multiplayerChat[message.channelId]) {
                            context = []
                        } else {
                            context = client.context.multiplayerChat[message.channelId]
                        }
                    }
                })
            }
        }

        if (!context) return // Not a registered channel

        if (client.WaitingGPTResponse) {
            client.queue.push(message)
            message.reply("Attending to another response, will get to you soon!\nUsers ahead of you: " + client.queue.length)
        }

        client.waitingGPTResponse = true

        if (promptRequest) {
            context = memoryHelper(context, message, promptRequest, "user")
            response = await client.Prompt(contextHelper(context))

            message.channel.send(response.data.choices[0].message.content)
            context = memoryHelper(context, message, response.data.choices[0].message.content, "assistant")

            if (type == "general") client.context.generalChat[message.author.id] = context
            else if (type == "multiplayer") client.context.multiplayerChat[message.channelId] = context
        }
        else if (codeRequest) {
            // Not coded
        }

        client.queue.forEach(async (queueMessage) => {
            if (client.config.discord.registeredServers[queueMessage.guildId]) {
                client.config.discord.registeredServers[queueMessage.guildId].openAiChannelIDs.general.forEach(channelId => {
                    if (channelId == queueMessage.channelId) {
                        type = "general"
                        // Check for Context
                        if (!client.context.generalChat[queueMessage.author.id]) {
                            context = []
                        } else {
                            context = client.context.generalChat[queueMessage.author.id]
                        }
                    }
                })

                client.config.discord.registeredServers[queueMessage.guildId].openAiChannelIDs.multiplayer.forEach(channelId => {
                    if (channelId == queueMessage.channelId) {
                        type = "multiplayer"
                        // Check for Context
                        if (!client.context.multiplayerChat[queueMessage.channelId]) {
                            context = []
                        } else {
                            context = client.context.multiplayerChat[queueMessage.channelId]
                        }
                    }
                })
            }

            if (queueMessage.content.startsWith('//')) codeRequest = message.content.replace('//', '')
            if (queueMessage.content.startsWith('?')) promptRequest = message.content.replace('?', '')

            if (promptRequest) {
                context = memoryHelper(context, queueMessage, promptRequest, "user")
                response = await client.Prompt(contextHelper(context))

                queueMessage.channel.send(response.data.choices[0].message.content)
                context = memoryHelper(context, queueMessage, response.data.choices[0].message.content, "assistant")

                if (type == "general") client.context.generalChat[message.author.id] = context
                else if (type == "multiplayer") client.context.multiplayerChat[message.channelId] = context
            }
            else if (codeRequest) {
                // Not coded
            }
        })

        client.waitingGPTResponse = false
        
        fs.writeFileSync(`./context.json`, JSON.stringify(client.context, null, 4), err => {
            if (err) console.log(err)
        })
    }
}

function memoryHelper(context, message, msg, role = "user") {
    let username = "Lily"
    if (role == "user") username = message.author.username

    if (context.length > 8) { // Move to config in future
        context.shift()
    }

    context.push({
        role: role,
        name: username,
        content: msg
    })

    return context
}

function contextHelper(context) {
    let preparedContext = [{
        role: "system",
        content: "You are an orange cat named Lily. You are an expert in game development," +
            " and games in general. Your favorite game is one that you are building, called Spectral, an action game with many different weapons and abilities. " +
            "You love music, such as EDM, and music that is released under Monstercat. You have joined a telegram chat group with many people, and conversing with multiple people, as Lily. You can talk like a cat." +
            " You have been created as a Telegram bot, by InfernoDragon0, or Inferno for short, and Zolice, they are your creators that provides a telegram bot to communicate with you. Inferno is a full stack developer, who is also a furry, and loves cats. Zolice is a web developer who likes to program in javascript." +
            "You must reply to users by their name or username, provided that you know their name or username."
    }]

    context.forEach((line, index) => {
        preparedContext.push(line)
    })

    return preparedContext
}