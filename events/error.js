module.exports = {
    name: 'error',
    once: true,
    execute(message, client, openai) { 
        console.log(message)
    }
}