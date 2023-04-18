import { Client, EmbedBuilder, Message } from "discord.js";
import { BaseCallbackHandler } from "langchain/callbacks";
import { ChainValues, AgentAction, AgentFinish } from "langchain/schema";

export class SuperLilyCallbackHandler extends BaseCallbackHandler {
  private ctx: Message
  private embed: EmbedBuilder
  private message: Message

  constructor(client: Client, ctx: Message) {
    super()
    this.ctx = ctx
    this.embed = new EmbedBuilder()
      .setAuthor({ name: ctx.member.displayName, iconURL: ctx.author.avatarURL() })
      .setThumbnail(client.user.avatarURL())
      .setTitle(ctx.content)
      .setTimestamp()
      .setFooter({ text: `Provided by ${client.user.username}`, iconURL: client.user.avatarURL() })
      .setColor('Random')
  }

  async handleChainError(err: any, verbose?: boolean): Promise<void> {
    console.log("an tool errored:" + err)
    // this.ctx.channel.send("error:" + err)
    this.embed.addFields(
      { name: "Error", value: err }
    )

  }

  async handleChainStart(chain: { name: string }) {
    console.log(`Entering new ${chain.name} chain...`);
    this.message = await this.ctx.channel.send({ embeds: [this.embed] })
  }

  async handleChainEnd(_output: ChainValues) {
    console.log("Finished chain. Output: " + _output);
    console.log(_output)
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

    this.embed.addFields(
      { name: thinking, value: `Using ${action.tool} on ${action.toolInput}` }
    )
    this.message.edit({ embeds: [this.embed] })
    // this.ctx.channel.send(thinking + "\nI will need to use " + action.tool + " to think about " + action.toolInput)
  }

  async handleToolEnd(output: string) {
    console.log("an tool ended:" + output);
  }

  async handleText(text: string) {
    console.log("an tool texted:" + text);
  }

  async handleAgentEnd(action: AgentFinish) {
    console.log("an agent ended:" + action.log);

    this.embed.addFields({ name: "Finished", value: action.log })
    this.message.edit({ embeds: [this.embed] })
  }
}