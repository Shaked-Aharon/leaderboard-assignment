import pool from "../dal/db.config";
import redisClient from "../dal/redis.config";

export class UsersService {
    static async addUser(name: string, imageUrl: string, initialScore: number) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(
                'INSERT INTO Users (name, imageUrl) VALUES ($1, $2) RETURNING id',
                [name, imageUrl]
            );
            const userId = result.rows[0].id;
            await client.query('INSERT INTO Scores (userId, score) VALUES ($1, $2)', [userId, initialScore]);
            await client.query('COMMIT');
            return userId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async updateUserScore(userId: number, score: number) {
        const client = await pool.connect();
        try {
            await client.query('UPDATE Scores SET score = score + $1 WHERE userId = $2', [score, userId]);
            // Invalidate Redis cache for leaderboard
            redisClient.del('leaderboard');
        } finally {
            client.release();
        }
    };
}