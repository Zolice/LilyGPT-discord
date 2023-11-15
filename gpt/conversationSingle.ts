import Lily from "./lily"

const ConversationSingle = async (prompt: string) => {

    const preparedContext: any = {
        role: "user",
        content: prompt,
    }
    
    try {
        const response = await Lily.chat.completions.create({
            model: "gpt-4",
            messages: [preparedContext],
            max_tokens: 400,
    
        })
        console.log(response)
        
        return (response.choices[0].message.content ?? "Sorry, i couldn't generate a response, as there was no reply c: ")
        
    } catch (e) {
        return ("Sorry, i couldn't generate a response c: " + e)
    }
}

export default ConversationSingle