import mysql from 'mysql2/promise';

export class Database {
    private static instance: Database;
    private pool: mysql.Pool;

    // Private constructor to prevent direct instantiation
    private constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || '51.89.14.91',
            user: process.env.DB_USER || 'teddy',
            password: process.env.DB_PASSWORD || 'Messi911',
            database: process.env.DB_NAME || 'star',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    /**
     * Gets the singleton instance of the Database class.
     * @returns The Database instance.
     */
    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    /**
     * Gets the MySQL connection pool.
     * @returns The MySQL connection pool.
     */
    public getPool(): mysql.Pool {
        return this.pool;
    }
}
