import express from 'express';
import pool from './dal/db.config';
import LeaderboardController from './controllers/leaderboard.controller';
import UsersController from './controllers/users.controller';
import redisClient from './dal/redis.config';
import createTables from './dal/createTables';
import dotenv from 'dotenv';

dotenv.config({path: process.env.NODE_ENV !== 'test' ? '../.env' : '../.env.test'});

const app = express();
app.use(express.json());

app.use('/users', UsersController);
app.use('/leaderboard', LeaderboardController);

const PORT = process.env.PORT || 3000;
pool.connect().then((client) => {
    createTables();
    console.log('Database connection is good');
    redisClient.connect().then(() => {
        console.log('Redis connection is good');
        client.release();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
})

export default app;
