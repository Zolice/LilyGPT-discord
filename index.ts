import { Client, Collection, GatewayIntentBits, PermissionsBitField } from 'discord.js'
import path from 'path'
import fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config()

import EventManager from './events/eventManager'
import { CommandManager } from './commands/commandManager'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
})

EventManager(client)

CommandManager()

client.login(process.env.DISCORD_API_KEY)