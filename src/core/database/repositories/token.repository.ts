import type {Pool, RowDataPacket, ResultSetHeader} from 'mysql2/promise';
import { TOKEN_QUERIES } from './constants/token.constants.js';

export class TokenRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    /**
     * Retrieves a token row from the database by its word.
     * @param word The word to search for.
     * @returns The token row data or null if not found.
     */
    public async getTokenByWord(word: string): Promise<RowDataPacket | null> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            TOKEN_QUERIES.GET_TOKEN_BY_WORD,
            [word]
        );
        
        return rows[0] ?? null;
    }

    /**
     * Saves a new token to the database.
     * @param word The word to save.
     * @returns The ID of the inserted token.
     */
    public async saveToken(word: string): Promise<number> {
        const [result] = await this.pool.execute<ResultSetHeader>(
            TOKEN_QUERIES.INSERT_TOKEN,
            [word]
        );
        return result.insertId;
    }
}
