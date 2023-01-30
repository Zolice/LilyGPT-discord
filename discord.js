require('dotenv').config()

const fs = require("fs")
const fs_extra = require("fs-extra")

const { Client, Events, GatewayIntentBits } = require('discord.js')
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
})

const { Configuration, OpenAIApi } = require('openai')

//config openai
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.chatGPTToken }))

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

// const eventsPath = path.join(__dirname, 'events');
// const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// for (const file of eventFiles) {
// 	const filePath = path.join(eventsPath, file);
// 	const event = require(filePath);
// 	if (event.once) {
// 		client.once(event.name, (...args) => event.execute(...args));
// 	} else {
// 		client.on(event.name, (...args) => event.execute(...args));
// 	}
// }

client.on(Events.MessageCreate, async (message) => {
    if (!message.content.startsWith('?')) return

    var msg = message.content.replace('?', '')

    // Access the API and get API response
    const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: msg,
        max_tokens: 256,
        temperature: 0.9,
        n: 1,
        stream: false,
        stop: [' Human:', ' AI:'],
        })
    
    console.log(response.data)
    console.log(response.data.choices[0].text)
    message.channel.send("your request: "  + msg) // Return the response

    message.channel.send("my response: " + response.data.choices[0].text)

    // if(response){
    //     console.log(response)
    //     message.channel.send(response)
    // }
})

client.login(process.env.discordToken)