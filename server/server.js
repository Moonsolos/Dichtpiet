import { ChatOpenAI } from "@langchain/openai";
import express from 'express';
import cors from 'cors';

const app = express();
const router = express.Router();

app.use(cors()); // Add CORS middleware before other middleware or routes

app.use(express.json());

const model = new ChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
});

const poem = await model.invoke("Schrijf een Sinterklaas gedicht")
console.log(poem.content)

app.use('/', router);

router.post('/chat', async (req, res) => {
    try {
        const { query } = req.body;
        const response = await model.invoke(query);
        res.json({ response });
    } catch (error) {
        console.log("error chat query");
        res.status(500).json({ error: "er is een fout met de query" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`De server staat aan op ${process.env.PORT}`);
});

const messageHistory = []; // Initialize an array to store message history

router.post('/chat', async (req, res) => {
    try {
        const { query } = req.body;

        // Store user input in the message history
        messageHistory.push({ user: query });

        const response = await model.invoke(query);

        // Store AI response in the message history
        messageHistory.push({ bot: response });

        res.json({ response });
    } catch (error) {
        console.error("error chat query:", error);
        res.status(500).json({ error: "er is een fout met de query" });
    }
});

router.get('/history', (req, res) => {
    res.json({ messageHistory });
});