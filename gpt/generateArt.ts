import Lily from "./lily"

const GenerateArt = async (prompt: string, user: string): Promise<string> => {
    try {
        console.log(prompt)
        const response = await Lily.images.generate(
            {
                prompt: prompt,
                n: 1,
                size:"1024x1024",
                user: user,
                model: "dall-e-3"
            }
        )
        
        console.log(response.data[0].url)
        return response.data[0].url
    } catch (error) {
        return `Sorry, I couldn't generate an image with your prompt "${prompt}" :c`
    }
}

export default GenerateArt