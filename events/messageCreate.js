module.exports = {
    name: 'messageCreate',
    // once: true,
    async execute(message, client, fs) {
        if (!message.content.startsWith('?') && !message.content.startsWith('//')) return

        var codex = message.content.startsWith('//')
        var msg = message.content.replace('?', '')
        if (msg == "") return

        var context = null
        var type = null

        if (client.config.discord.registeredServers[message.guildId]) {
            client.config.discord.registeredServers[message.guildId].openAiChannelIDs.general.forEach(channelId => {
                if (channelId == message.channelId) {
                    type = "general"
                    // Check for Context
                    if (!client.context.generalChat[message.author.id]) {
                        context = []
                    } else {
                        context = client.context.generalChat[message.author.id]
                        if (context.length > 6) {
                            // context.shift()
                            // context.shift()
                            context.pop()
                            context.pop()
                        }
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
                        if (context.length > 6) {
                            context.shift()
                            context.shift()
                            // context.pop()
                            // context.pop()
                        }
                    }
                }
            })
        }
        else return

        if (!context) return

        // Send a message
        let reply = await message.reply('Getting a response...')

        if (!codex) context.push(`Human: ${msg}`)
        // context.splice(0, 0, `Human: ${msg}`)

        var contextString
        context.forEach((line, index) => {
            contextString += line + '\n'
        })

        var response
        // Access the API and get API response
        if (codex) {
            response = await client.openai.createCompletion({
                model: "code-davinci-002",
                prompt: msg,
                max_tokens: 512,
                temperature: 0,
                n: 1,
                stream: false,
            }).catch((err) => {
                reply.edit("Due to an error, I couldn't get a response. Erorr: " + err)
                console.log(err)
                return
            })

            console.log(response.data)
        }
        else {
            const preparedContext = [
                {role: "system", content: "You are an orange cat named Lily, you know a lot about game development, and games in general. Your favorite game is one that you are building, called Spectral, an action game with many different weapons and abilities. You are also a member of the Spectral Discord server, and you are talking to people who likes to play games."},
            ]

            context.forEach((line, index) => {
                if (line.includes('Human:')) {
                    preparedContext.push({role: "user", content: line.replace('Human:', '')})
                }
                else if (line.includes('AI:')) {
                    preparedContext.push({role: "assistant", content: line.replace('AI:', '')})
                }
            })

            response = await client.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: preparedContext,
                max_tokens: 400,

            }).catch((err) => {
                reply.edit("Due to an error, I couldn't get a response. Erorr: " + err)
                console.log(err)
                return
            })

            console.log(response.data)
        }



        // Update context
        var responseText = ""
        if (codex) {
            responseText = response.data.choices[0].text.replace('\n', '')
        }
        else {
            responseText = response.data.choices[0].message.content
        }
        // while (responseText.includes('\n')) {
        //     responseText = responseText.replace('\n', '')
        responseText = responseText.replace('AI:', '')
        // }

        if (!codex) context.push(`AI: ${response.data.choices[0].message.content}`)
        // context.splice(0, 0, `AI: ${responseText}`)

        // Return the response
        reply.edit(responseText + ".") //the dot to prevent Cannot send an empty message errors


        switch (type) {
            case "general":
                client.context.generalChat[message.author.id] = context
                break
            case "multiplayer":
                client.context.multiplayerChat[message.channelId] = context
                break
        }
        fs.writeFileSync(`./context.json`, JSON.stringify(client.context, null, 4), err => {
            if (err) console.log(err)
        })
    },
}