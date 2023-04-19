import Lily from "./lily"

const ConversationSingle = async (prompt: string) => {

    const preparedContext: any = {
        role: "user",
        content: prompt,
    }

    const response = await Lily.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [preparedContext],
        max_tokens: 400,

    })
    console.log(response)
    if (response.status != 200) {
        return ("Sorry, i couldn't generate a response c: " + response.status)
    }
    else {
        return (response.data.choices[0].message.content ?? "Sorry, i couldn't generate a response c: " + response.status)
    }
}

export default ConversationSingle