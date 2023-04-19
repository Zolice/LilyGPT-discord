import { Tool } from "langchain/agents"
import {load} from "cheerio";

class WebScraper extends Tool {
    name = "web-browser"
    description = "a web browser. useful after a google-search for when you need to go through a url to get answers. input should be the http or https url."
    
    async _call(arg: string): Promise<string> {
        const requestURL = `${arg}`
    
        const response = await fetch(requestURL);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const res = await response.text()
        const $ = load(res);
        // console.log(res)
        

        const finaltext = $("body").text().replace(/\s+/g, ' ').trim();
        const finalOutput = finaltext.slice(0,2048)
        console.log(finalOutput)
        return finalOutput
    }
}

export default WebScraper