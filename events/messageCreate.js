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
            response = await client.openai.createCompletion({
                model: client.config.openai.selectedModel,
                prompt: contextString + "\nAI:",
                max_tokens: 256,
                temperature: 0.9,
                n: 1,
                stream: false,
                stop: [' Human:', ' AI:'],
            }).catch((err) => {
                reply.edit("Due to an error, I couldn't get a response. Erorr: " + err)
                console.log(err)
                return
            })

            console.log(response.data)
        }



        // Update context
        var responseText = response.data.choices[0].text.replace('\n', '')
        while (responseText.includes('\n')) {
            responseText = responseText.replace('\n', '')
            responseText = responseText.replace('AI:', '')
        }

        if (!codex) context.push(`AI: ${response.data.choices[0].text}`)
        // context.splice(0, 0, `AI: ${responseText}`)

        // Return the response
        reply.edit(response.data.choices[0].text + ".") //the dot to prevent Cannot send an empty message errors


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