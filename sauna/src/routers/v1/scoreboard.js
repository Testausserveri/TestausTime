import express from 'express';
import { getTop10 } from '../../database.js';
export const route = '/scoreboard';
export const router = express.Router();
router.get('/', (req, res) => {
    res.json({
        message: 'Scoreboard working'
    });
});

router.get('/top10', async (req, res) => {
    const scoreboard = [];
    const top10 = await getTop10();
    await Promise.all(top10.map(async (user) => {
        try {
            scoreboard.push({
                userID: user.userID,
                discordUser: await user.getDiscordUser(),
                totalTime: user.getTotalTime(),
            });
        } catch(e) {
            return; 
        }
    }));
    res.json({
        message: 'Scoreboard OK!',
        scoreboard,
    });
});