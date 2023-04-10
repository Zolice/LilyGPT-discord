import { Collection } from 'discord.js';
import { sayData, sayExecute } from './say'

export const Commands = new Collection<string, any>()

export const CommandManager = () => {
    Commands.set(sayData.name, sayExecute)
}