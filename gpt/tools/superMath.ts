import { Tool } from "langchain/agents"

class SuperMathAPI extends Tool {
    name = "calculator"
    description = "to calculate math expressions, input is the expression for the calculation. Optionally include precision=x where x is the significant figures."

    async _call(arg: string): Promise<string> {
        const encoded = encodeURIComponent(arg)
        const requestURL = `https://api.mathjs.org/v4/?expr=${encoded}`
    
        const response = await fetch(requestURL);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const res = await response.text()
        console.log(res)
        // console.log(finalOutput)
        return res
    }
}

export default SuperMathAPI