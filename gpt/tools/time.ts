import { Tool } from "langchain/agents"

class TimeAPI extends Tool {
    name = "time"
    description = "to look up the current time, input is the Full IANA time zone name."

    async _call(arg: string): Promise<string> {
        const requestURL = `https://timeapi.io/api/Time/current/zone?timeZone=${arg}`
    
        const response = await fetch(requestURL);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const res = await response.json()
        // console.log(res)
        const timeresult = res.date + " " + res.time + " " + res.timeZone
        // console.log(finalOutput)
        return timeresult
    }
}

export default TimeAPI