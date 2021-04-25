import express from 'express';
import { getTop10 } from '../../database.js';
export const route = '/scoreboard';
export const router = express.Router();
router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'Scoreboard working'
    });
});
router.get('/top10', async (req, res) => {
    const scoreboard = [];
    const top10 = await getTop10();
    top10.forEach((user) => {
        scoreboard.push({
            userID: user.userID,
            totalTime: user.getTotalTime(),
        });
    });
    res.json({
        status: 200,
        message: 'Scoreboard OK!',
        scoreboard,
    });
});