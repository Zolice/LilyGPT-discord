import Lily from "./lily"

const GenerateArt = async (prompt: string, user: string): Promise<string> => {
    console.log(prompt)
    const response = await Lily.createImage(
        {
            prompt: prompt,
            n: 1,
            size:"256x256",
            user: user
        }
    )
    if (response.status !== 200) {
        return `Sorry, I couldn't generate an image with your prompt "${prompt}" :c`
    }
    console.log(response.data.data[0].url)

    return response.data.data[0].url
}

export default GenerateArt