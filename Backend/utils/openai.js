import "dotenv/config";

const getOpenAIResponse = async (message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: message
            }]
        })
    };

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", options);
        const data = await response.json();
        return data.choices[0].message.content; // Return the reply
    }
    catch (err) {
        console.error("Error fetching OpenAI response:", err);
        throw err; // Rethrow the error to be handled by the caller
    }
};

export default getOpenAIResponse;