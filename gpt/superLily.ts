import { ChatOpenAI } from "langchain/chat_models"
import { ChatAgent, AgentExecutor } from "langchain/agents"
import { CallbackManager } from "langchain/callbacks";
import { SuperLilyCallbackHandler } from "./superLilyCallbacks";
import GoogleCustomSearchAPI from "./tools/googleCustomSearch";
import TimeAPI from "./tools/time";
import SuperMathAPI from "./tools/superMath";
import WebScraper from "./tools/scraper";
import { Client, Message } from "discord.js";

const SuperLily = async (client: Client, ctx: Message) => {
    const prompt: string = ctx.content
    const prompted = prompt.replace("!", "").replace("?", "").trim()

    // Define the list of tools the agent can use
    try {
        const tools = [new SuperMathAPI(), new GoogleCustomSearchAPI(), new TimeAPI(), new WebScraper()];
        const callbackManager = new CallbackManager();
        callbackManager.addHandler(new SuperLilyCallbackHandler(client, ctx))
        // Create the agent from the chat model and the tools
        const agent = ChatAgent.fromLLMAndTools(new ChatOpenAI({
            temperature: 0.3,
            maxTokens: 500,
            callbackManager: callbackManager
        }), tools);
        // Create an executor, which calls to the agent until an answer is found
        const executor = AgentExecutor.fromAgentAndTools({ agent, tools, callbackManager: callbackManager });
        executor.verbose = true;
        executor.returnIntermediateSteps = true;
        executor.maxIterations = 5;

        ctx.channel.send("Please give me a moment to think about your request.")
        const responseG = await executor.call(
            { input: prompted }
        );

        console.log(responseG);
        ctx.reply(responseG.output)
    }
    catch (e) {
        console.log("Error encountered: " + e)
    }

}

export default SuperLily