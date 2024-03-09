import { ChatOpenAI } from "@langchain/openai";
import express from 'express';
import cors from 'cors';

const app = express();
const router = express.Router();
const messageHistory = []; // Initialize an array to store message history

app.use(cors()); // Add CORS middleware before other middleware or routes
app.use(express.json());

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

router.post('/chat', async (req, res) => {
    try {
        const { query } = req.body;

        // Store user input in the message history
        messageHistory.push({ user: query });

        // Create a prompt with the conversation context
        const prompt = messageHistory.map(({ role, content }) => `${role}: ${content}`).join('\n') + `\n${query}\nAI:`;

        const response = await model.invoke(prompt);

        // Store AI response in the message history
        messageHistory.push({ bot: response });

        res.json({ response });
    } catch (error) {
        console.error("error chat query:", error);
        res.status(500).json({ error: "Er is een fout opgetreden bij het verwerken van de vraag" });
    }
});

router.get('/history', (req, res) => {
    res.json({ messageHistory });
});

router.post('/submit-response', async (req, res) => {
    try {
        // Verwerk het POST-verzoek voor het indienen van een gebruikersreactie
        // Haal de benodigde gegevens uit het verzoek
        const { name, hobby, userResponse, conversationHistory, questionId } = req.body;

        // Hier zou je de gebruikersreactie kunnen verwerken, bijvoorbeeld door het naar een model te sturen voor verwerking

        // Bij het genereren van een antwoord op een vraag
        // Haal de vraag op uit de database op basis van de unieke identificatie
        // Genereer het antwoord
        // Sla het antwoord op samen met de unieke identificatie in de database
        // Stuur het antwoord samen met de unieke identificatie terug naar de client

        // Stuur een succesreactie terug naar de client
        res.json({ success: true, message: "User response submitted successfully" });
    } catch (error) {
        console.error("Error submitting user response:", error);
        res.status(500).json({ success: false, error: "Error submitting user response" });
    }
});

app.use('/', router);

app.listen(process.env.PORT, () => {
    console.log(`De server staat aan op ${process.env.PORT}`);
});
