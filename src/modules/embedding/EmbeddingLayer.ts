import fs from 'fs/promises';
import { EMBEDDING_CONSTANTS } from './constants/embedding.constants.js';

export class EmbeddingLayer {
    public readonly vocabSize: number;
    public readonly dModel: number;
    private weights!: Float32Array;

    constructor(
        vocabSize: number = EMBEDDING_CONSTANTS.DEFAULT_VOCAB_SIZE, 
        dModel: number = EMBEDDING_CONSTANTS.DEFAULT_D_MODEL
    ) {
        this.vocabSize = vocabSize;
        this.dModel = dModel;
        this.allocateWeights();
    }

    /**
     * Allocates the memory for the weights array.
     */
    private allocateWeights(): void {
        this.weights = new Float32Array(this.vocabSize * this.dModel);
    }

    /**
     * Initializes the embedding layer.
     * It attempts to load weights from the specified file.
     * If the file does not exist, it generates random weights (Xavier initialization)
     * and saves them to the file.
     * 
     * @param filePath Path to the .bin file.
     */
    public async initialize(filePath: string): Promise<void> {
        try {
            await fs.access(filePath);
            await this.loadFromFile(filePath);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                this.initializeRandomWeights();
                await this.saveToFile(filePath);
            } else {
                throw error;
            }
        }
    }

    /**
     * Fills the weights array with random values.
     * Uses a simple normal distribution approximation (Xavier-like).
     */
    private initializeRandomWeights(): void {
        const limit = Math.sqrt(2.0 / (this.vocabSize + this.dModel));
        for (let i = 0; i < this.weights.length; i++) {
            this.weights[i] = (Math.random() * 2 - 1) * limit;
        }
    }

    /**
     * Loads embeddings from a binary file.
     * @param filePath Path to the .bin file.
     */
    public async loadFromFile(filePath: string): Promise<void> {
        const buffer = await fs.readFile(filePath);
        const expectedBytes = this.vocabSize * this.dModel * Float32Array.BYTES_PER_ELEMENT;
        
        if (buffer.length !== expectedBytes) {
            throw new Error(`Invalid file size. Expected ${expectedBytes} bytes, got ${buffer.length} bytes.`);
        }

        this.weights = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / Float32Array.BYTES_PER_ELEMENT);
    }

    /**
     * Saves the current embeddings to a binary file.
     * @param filePath Path to save the .bin file.
     */
    public async saveToFile(filePath: string): Promise<void> {
        const buffer = Buffer.from(this.weights.buffer, this.weights.byteOffset, this.weights.byteLength);
        await fs.writeFile(filePath, buffer);
    }

    /**
     * Retrieves the embedding vector for a single token ID.
     * Uses `subarray` for zero-copy memory access.
     * 
     * @param tokenId The ID of the token.
     * @returns A Float32Array representing the embedding vector.
     */
    public getEmbedding(tokenId: number): Float32Array {
        if (tokenId < 0 || tokenId >= this.vocabSize) {
            throw new Error(`Token ID ${tokenId} is out of bounds (0 - ${this.vocabSize - 1})`);
        }
        const offset = tokenId * this.dModel;
        return this.weights.subarray(offset, offset + this.dModel);
    }

    /**
     * Retrieves a concatenated array of embeddings for multiple token IDs.
     * Useful for passing a sequence of tokens to the next layer of a Transformer.
     * 
     * @param tokenIds An array of token IDs.
     * @returns A new Float32Array containing all requested embeddings sequentially.
     */
    public getEmbeddings(tokenIds: number[]): Float32Array {
        const result = new Float32Array(tokenIds.length * this.dModel);
        
        for (let i = 0; i < tokenIds.length; i++) {
            const tokenId = tokenIds[i];
            if (tokenId === undefined || tokenId < 0 || tokenId >= this.vocabSize) {
                throw new Error(`Token ID ${tokenId} at index ${i} is out of bounds`);
            }
            
            const offset = tokenId * this.dModel;
            const embedding = this.weights.subarray(offset, offset + this.dModel);
            result.set(embedding, i * this.dModel);
        }
        
        return result;
    }
}
