import express, { type Request, type Response } from 'express';
import { Database } from "./core/database/Database.js";
import { Tokenizer } from "./modules/tokenizer/Tokenizer.js";

const app = express();
const port = process.env.PORT || 3000;

// 1. Get the database pool instance
const dbPool = Database.getInstance().getPool();

// 2. Pass the pool into the Tokenizer (Dependency Injection)
const tokenizer = new Tokenizer(dbPool);

app.get('/', async (req: Request, res: Response) => {
    const result = await tokenizer.encode('This is an example of the string Taras.');
    //const result = await tokenizer.decode([1, 4, 6]);
    res.send(result);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
