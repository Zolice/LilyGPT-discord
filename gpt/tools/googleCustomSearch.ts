import { Tool } from "langchain/agents"

class GoogleCustomSearchAPI extends Tool {
    name = "google-search"
    description = "a search engine. useful for when you need to search for links to answer about current events. input should be a search query."
    
    key: string
    searchid: string

    constructor() {
        super();
        this.key = process.env.CUSTOM_SEARCH_API_KEY || ""
        this.searchid = process.env.SEARCH_ID || ""

        if (this.key == "") {
            throw new Error("CUSTOM_SEARCH_API_KEY for Google Custom Search not defined, please add a key in your .env file!")
        }
        if (this.searchid == "") {
            throw new Error("SEARCH_ID for Google Custom Search not defined, please add a key in your .env file!")
        }
    }

    async _call(arg: string): Promise<string> {
        const requestURL = `https://www.googleapis.com/customsearch/v1?key=${this.key}&num=3&cx=${this.searchid}&q=${arg}`
    
        const response = await fetch(requestURL);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const res = await response.json()
        // console.log(res)
        const items = res.items

        let finalOutput = ""
        if (!items) {
            return "No Results found"
        }

        if (items.length > 0) {
            for (const item of items) {
                const title = item.title
                const link = item.formattedUrl
                const snippet = item.snippet

                finalOutput += `[${title} (${link}): ${snippet}]`
            }
        }
        else {
            return "No Results found"
        }
        // console.log(finalOutput)
        return finalOutput
    }
}

export default GoogleCustomSearchAPI