import { Collection } from 'discord.js';
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