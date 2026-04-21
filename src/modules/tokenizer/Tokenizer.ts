import mysql from 'mysql2/promise';
import { TokenRepository } from '../../core/database/repositories/token.repository.js';

export class Tokenizer {
    private readonly dbPool: mysql.Pool;
    private tokenRepository: TokenRepository;

    constructor(dbPool: mysql.Pool) {
        this.dbPool = dbPool;
        this.tokenRepository = new TokenRepository(this.dbPool);
    }

    /**
     * Encodes a given text into an array of token IDs.
     * It splits the text into words and punctuation, then retrieves or generates an ID for each.
     * 
     * @param text The input string to be encoded.
     * @returns A promise that resolves to an array of token IDs representing the input text.
     */
    public async encode(text: string): Promise<number[]> {
        const splitText = this.splitWords(text);
        return await this.convertWordsToIds(splitText);
    }

    /**
     * Converts an array of token IDs back into a single string.
     * It retrieves the corresponding word for each ID from the database and joins them.
     * 
     * @param ids An array of token IDs.
     * @returns A promise that resolves to the decoded string.
     */
    public async decode(ids: number[]): Promise<string> {
        const words: string[] = [];
        
        for (const id of ids) {
            const token = await this.tokenRepository.getTokenById(id);
            if (token && token.title) {
                words.push(token.title);
            }
        }
        
        return words.join(' ');
    }

    /**
     * Converts an array of words into their corresponding token IDs.
     * 
     * @param words An array of words and punctuation marks.
     * @returns A promise that resolves to an array of token IDs.
     */
    private async convertWordsToIds(words: string[]): Promise<number[]> {
        const ids: number[] = [];

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (word !== undefined) {
                const id = await this.preserveToken(word);
                ids.push(id);
            }
        }
        
        return ids;
    }

    /**
     * Retrieves the ID of a given word from the database.
     * If the word does not exist, it is saved as a new token and its new ID is returned.
     * 
     * @param word The word or punctuation mark to preserve.
     * @returns A promise that resolves to the ID of the token.
     */
    private async preserveToken(word: string): Promise<number> {
        const token = await this.tokenRepository.getTokenByWord(word);
        if (!token) {
            return await this.tokenRepository.saveToken(word);
        }
        return token.id;
    }

    /**
     * Splits a given text into an array of words and punctuation marks.
     * It separates alphanumeric words from individual non-word characters (like dots, commas, etc.)
     * while ignoring whitespace.
     * 
     * @param text The input string to be split.
     * @returns An array containing the extracted words and punctuation characters.
     */
    public splitWords(text: string): string[] {
        return text.match(/\w+|[^\w\s]/g) || [];
    }
}