import express, { type Request, type Response } from 'express';
import { Database } from "./core/database/Database.js";
import { Tokenizer } from "./modules/tokenizer/Tokenizer.js";
import {EmbeddingLayer} from "./modules/embedding/EmbeddingLayer.js";

const app = express();
const port = process.env.PORT || 3000;

// 1. Get the database pool instance
const dbPool = Database.getInstance().getPool();

// 2. Pass the pool into the Tokenizer (Dependency Injection)
const tokenizer = new Tokenizer(dbPool);
const embeddingLayer = new EmbeddingLayer();

app.get('/', async (req: Request, res: Response) => {
    const text1 = 'This is an example of the string Taras.';
    const result = await tokenizer.encode('This');
    await embeddingLayer.initialize('src/bin/embeddings.bin');
    const embeddings = embeddingLayer.getEmbeddings(result);

    //const result = await tokenizer.decode([1, 4, 6]);
    //res.send(embeddings);
    res.json(Array.from(embeddings));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});