module.exports = {
    name: 'messageCreate',
    // once: true,
    async execute(message, client, fs) {
        if (!message.content.startsWith('?')) return

        var msg = message.content.replace('?', '')

        var enabled = false
        var context

        client.config.discord.registeredServers.forEach(server => {
            server.openAiChannelIDs.general.forEach(channelId => {
                if (channelId == message.channelId) {
                    enabled = true
                }
            })
            server.openAiChannelIDs.multiplayer.forEach(channelId => {
                if (channelId == message.channelId) {
                    enabled = true
                }
            })
        })

        if(!enabled) return

        // Send a message
        let reply = await message.reply('Getting a response...')

        // Check for Context
        if (!client.context.multiplayerChat[message.channelId]) {
            context = []
        } else {
            context = client.context.multiplayerChat[message.channelId]
            if (context.length > 4) {
                // context.shift()
                // context.shift()
                context.pop()
                context.pop()
            }
        }
        // context.push(`Human: ${msg}`)
        context.splice(0,0,`Human: ${msg}`)

        // Access the API and get API response
        const response = await client.openai.createCompletion({
            model: client.config.openai.selectedModel,
            prompt: context,
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

        // Return the response
        reply.edit(response.data.choices[0].text)

        // Update context
        response.data.choices[0].text.replace('\n\n', '')
        // context.push(`AI: ${response.data.choices[0].text}`)
        context.splice(0,0,`AI: ${response.data.choices[0].text}`)
        client.context.multiplayerChat[message.channelId] = context
        fs.writeFileSync(`./context.json`, JSON.stringify(client.context, null, 4), err => {
            if (err) console.log(err)
        })
    },
}