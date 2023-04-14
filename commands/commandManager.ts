import { Collection } from 'discord.js';
import { sayData, sayExecute } from './say'
import { clearData, clearExecute } from './clearcontext';

export const Commands = new Collection<string, any>()

export const CommandManager = () => {
    Commands.set(sayData.name, sayExecute)
    Commands.set(clearData.name, clearExecute)
}