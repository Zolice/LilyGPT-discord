require('dotenv').config()

const fs = require("fs")
const fs_extra = require("fs-extra")
const path = require("path")

const { Client, Collection, GatewayIntentBits } = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
})

client.context = require('./context.json')
client.config = require('./config.json')

const { Configuration, OpenAIApi } = require('openai')

//config openai
client.openai = new OpenAIApi(new Configuration({ apiKey: process.env.chatGPTToken }))

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// for (const file of eventFiles) {
eventFiles.forEach((file, index) => {
    console.log(`${index}: Event ${file} loaded.`)
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (message) => event.execute(message, client, fs));
    } else {
        client.on(event.name, (message) => event.execute(message, client, fs));
    }
})

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

commandFiles.forEach((file, index) => {
    console.log(`${index}: Command ${file} loaded.`)
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
})


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.login(process.env.discordSecret)