import pool from "../dal/db.config";
import redisClient from "../dal/redis.config";
import { User } from "../models/User";

export class LeaderboardService {
  static async getTopNUsers(n: number): Promise<User[]> {
    const cached = await redisClient.get('leaderboard');
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await pool.query(`
          SELECT u.id, u.name, u.imageUrl, s.score
          FROM Users u
          JOIN Scores s ON u.id = s.userId
          ORDER BY s.score DESC
          LIMIT $1
        `, [n]);

    const users: User[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      imageUrl: row.imageUrl,
      totalScore: row.score,
    }));

    // Cache the leaderboard in Redis
    redisClient.set('leaderboard', JSON.stringify(users), { EX: 60 }); // Cache for 1 minute

    return users;
  };

  static async getUserWithSurroundingUsers(userId: number) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        WITH ranked_leaderboard AS (
          SELECT 
            u.id, u.name, u.imageUrl, s.score,
            ROW_NUMBER() OVER (ORDER BY s.score DESC) AS rank
          FROM users u
          JOIN scores s ON u.id = s.userId
        )
        SELECT * FROM ranked_leaderboard
        WHERE rank BETWEEN GREATEST((SELECT rank FROM ranked_leaderboard WHERE id = $1) - 5, 1)
                       AND (SELECT rank FROM ranked_leaderboard WHERE id = $1) + 5;
      `, [userId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching user position with surrounding users', error);
      throw error;
    } finally {
      client.release();
    }
  };
}