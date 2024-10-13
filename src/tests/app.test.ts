import request from 'supertest';
import app from '../app';
import redisClient from '../dal/redis.config';
import pool from '../dal/db.config';

afterAll(async () => {
    try {
        await pool.query('TRUNCATE users, scores RESTART IDENTITY CASCADE'); // Clean up DB after tests
        await redisClient.flushAll();
        if (redisClient.isOpen) {
            await redisClient.quit();
        }
        await pool.end();
    }catch(error: any){
        console.error('Error during afterAll cleanup:', error);
    }
});

describe('Leaderboard API', () => {
    it('should add a new user via POST /users', async () => {
        const response = await request(app)
            .post('/users')
            .send({ name: 'John Doe', imageUrl: 'https://image.com/avatar.png', initialScore: 1000 });

        expect(response.status).toBe(201);
        expect(response.body.userId).toBeDefined();
    });

    it('should update the user score via PUT /users/:id/score', async () => {
        const response = await request(app)
            .put('/users/1/score')
            .send({ score: 200 });

        expect(response.status).toBe(200);
        expect(response.text).toBe('Score updated successfully');
    });

    it('should get top N users via GET /leaderboard/top/:n', async () => {
        const response = await request(app).get('/leaderboard/top/2');

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body[0].name).toBe('John Doe');
    });
});
