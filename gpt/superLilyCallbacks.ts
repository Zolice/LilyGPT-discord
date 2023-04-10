import { Client, EmbedBuilder, Message } from "discord.js";
import { BaseCallbackHandler } from "langchain/callbacks";
import { ChainValues, AgentAction, AgentFinish } from "langchain/schema";

export class SuperLilyCallbackHandler extends BaseCallbackHandler {
  private ctx: Message
  private embed: EmbedBuilder

  constructor(client: Client, ctx: Message) {
    super()
    this.ctx = ctx
    this.embed = new EmbedBuilder()
    this.embed.setURL(ctx.url)
    this.embed.setAuthor({ name: ctx.author.username, iconURL: ctx.author.avatarURL() })
    this.embed.setThumbnail(client.user.avatarURL())
    this.embed.setTitle(ctx.content)
    this.embed.setTimestamp()
    this.embed.setFooter({ text: `Provided by ${client.user.username}`, iconURL: client.user.avatarURL() })
  }

  async handleChainError(err: any, verbose?: boolean): Promise<void> {
    console.log("an tool errored:" + err)
    this.ctx.channel.send("error:" + err)
  }

  async handleChainStart(chain: { name: string }) {
    console.log(`Entering new ${chain.name} chain...`);
    // this.ctx.channel.send({ embeds: [this.embed] })
  }

  async handleChainEnd(_output: ChainValues) {
    console.log("Finished chain.");
  }

  async handleAgentAction(action: AgentAction) {
    console.log("an action taken: " + action.log);
    const thought = action.log.split("Action:")
    let thinking = ""
    if (thought) {
      if (thought.length > 0) {
        thinking = thought[0]
      }
    }
    this.ctx.channel.send(thinking
      + "\nI will need to use " + action.tool + " to think about " + action.toolInput)
  }

  async handleToolEnd(output: string) {
    console.log("an tool ended:" + output);
  }

  async handleText(text: string) {
    console.log("an tool texted:" + text);
  }

  async handleAgentEnd(action: AgentFinish) {
    console.log("an agent ended:" + action.log);
  }
}