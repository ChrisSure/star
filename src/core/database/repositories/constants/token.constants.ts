export const TOKEN_QUERIES = {
    GET_TOKEN_BY_WORD: 'SELECT * FROM tokens WHERE title = ? LIMIT 1',
    INSERT_TOKEN: 'INSERT INTO tokens (title) VALUES (?)'
} as const;
