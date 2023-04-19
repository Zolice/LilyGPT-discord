import { Client, PermissionsBitField } from "discord.js"

const CheckAdmin = (guildID:string, userID: string, client: Client) => {
    return client.guilds.cache.get(guildID).members.cache.get(userID).permissions.has(PermissionsBitField.Flags.Administrator)
}

export default CheckAdmin