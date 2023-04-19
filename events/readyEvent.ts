import { Client, ActivityType } from "discord.js";

const ReadyEvent = (client: Client) => {
    console.log(`Logged in as ${client.user.tag}!`)
    client.user.setActivity("without a brain", { type: ActivityType.Playing });
}

export default ReadyEvent