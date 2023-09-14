import { REST, Routes, Collection } from 'discord.js';
import { sayData, sayExecute } from './say'
import { clearData, clearExecute } from './clearcontext';
import { artData, artExecute } from './art';

export const InteractionCommands = new Collection<string, any>()

export const InteractionCommandManager = () => {
    InteractionCommands.set(sayData.name, sayExecute)
    InteractionCommands.set(clearData.name, clearExecute)
    InteractionCommands.set(artData.name, artExecute)
}

export const MessageCommands = new Collection<string, any>()

export const MessageCommandManager = () => {

}

// Used to add the commands to the Discord bot
export const RegisterCommands = () => {
    // Prepare REST API
    let rest = new REST({ version: '9' }).setToken(process.env.DISCORD_API_KEY);

    // Make a collection of commands
    let commands = new Collection<string, any>()
    commands.set(sayData.name, sayData)
    commands.set(clearData.name, clearData)
    commands.set(artData.name, artData)

    // Send the commands to Discord
    console.log('Started refreshing application (/) commands.');
    async () => {
        try {
            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commands },
            );
        } catch (error) {
            console.error(error);
        }
    }
}