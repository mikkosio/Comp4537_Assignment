const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

let userHistory = [];

// Enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Route to start the conversation
app.post("/startConversation", async (req, res) => {
    const userMessage = req.body.userMessage;

    // Send user message to the chat system and get the bot's response
    const botResponse = await chat(userMessage);

    // Update user message history
    userHistory.push({ user: userMessage, bot: botResponse });

    // Send bot's response as the API response
    res.json({ botResponse });
});

// Route to continue the conversation
app.post("/continueConversation", async (req, res) => {
    const userMessage = req.body.userMessage;

    // Send user message and history to the chat system and get the bot's response
    const botResponse = await chatWithHistory(userMessage, userHistory);

    // Update user message history
    userHistory.push({ user: userMessage, bot: botResponse });

    // Send bot's response as the API response
    res.json({ botResponse });
});

// Function to handle user input and bot responses
async function chat(userMessage) {
    // Send user message to bot and get response
    const botResponse = await query({ "inputs": userMessage });

    // Extract and clean bot's response
    const cleanedBotResponse = cleanResponse(extractResponse(JSON.stringify(botResponse)));

    return cleanedBotResponse;
}

// Function to handle conversation continuation with history
async function chatWithHistory(userMessage, history) {
    // Construct history template
    let historyTemplate = `
        Reply as a chatbot.
        Below is the previous messages between you and the user for context, don't talk about the context in your response

        History: {
    `;

    // Add previous user and bot messages to history template
    for (const entry of history) {
        historyTemplate += `user: "${entry.user}"\n`;
        historyTemplate += `bot: "${entry.bot}"\n`;
    }

    historyTemplate += "}\n";

    // Construct the new user message placeholder
    const newUserMessagePlaceholder = `NEW_USER_MESSAGE: ${userMessage}\n`;

    // Replace the NEW_USER_MESSAGE placeholder with the new user message
    historyTemplate += newUserMessagePlaceholder;

    // Send user message and history template to bot and get response
    const botResponse = await query({ "inputs": historyTemplate });

    // Extract and clean bot's response
    const cleanedBotResponse = cleanResponse(extractResponse(JSON.stringify(botResponse)));

    return cleanedBotResponse;
}

// // Function to get user input from console
// function getUserInput() {
//     return new Promise((resolve) => {
//         const readline = require("readline").createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });

//         readline.question("", (userInput) => {
//             readline.close();
//             resolve(userInput);
//         });
//     });
// }

function extractResponse(responseText) {
	// Remove leading and trailing '\n', '`', or '```' characters
	let cleanedText = responseText.replace(/^[\n`]+|[\n`]+$/g, '');

	// Find the index of the last colon
	const lastIndex = cleanedText.lastIndexOf(':');

	// Extract the text after the last colon
	let extractedText = cleanedText.substring(lastIndex + 1);

	// Remove redundant symbols like '\n' at the end
	extractedText = extractedText.trim();

	return extractedText;
}

function cleanResponse(input) {
	// Remove \n, `, [, ], (, ), {, }, <, > and quotes
	const cleanedString = input.replace(/\\n|`|\[|\]|\(|\)|\{|\}|<|>|"|'/g, '');
	return cleanedString.trim();
}

async function query(data) {
const { default: fetch } = await import("node-fetch");
	const response = await fetch(
			"https://api-inference.huggingface.co/models/google/gemma-7b-it", {
					headers: { Authorization: "Bearer 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", "Content-Type": "application/json" },
					method: "POST",
					body: JSON.stringify(data),
			}
	);
	const result = await response.json();
	return result;
}

// Start the API server
app.listen(port, () => {
    console.log(`API server is running on http://localhost:${port}`);
});
