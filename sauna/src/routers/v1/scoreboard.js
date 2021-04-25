import express from 'express';
import { getTop10 } from '../../database.js';
import { getDiscordUserById } from '../../discordUtil.js';
export const route = '/scoreboard';
export const router = express.Router();
router.get('/', (req, res) => {
    res.json({
        message: 'Scoreboard working'
    });
});
let cacheLeaderboard = [];

let refreshCache = async () => {
    const scoreboard = [];
    const top10 = await getTop10();
    await Promise.all(top10.map(async (user) => {
        try {
            let discordUser = await getDiscordUserById(user.userID);
            scoreboard.push({
                userID: user.userID,
                discordUser,
                totalTime: user.getTotalTime(),
            });
        } catch(e) {
            return; 
        }
    }));
    cacheLeaderboard = scoreboard;
    console.log('Scoreboard cache refreshed.');
}
refreshCache();

const refreshTime = 5 * 60 * 1000;
// Refresh cache every * milliseconds
setInterval(() => {
    refreshCache();
}, refreshTime);

router.get('/top10', async (req, res) => {
    res.json({
        message: 'Scoreboard OK!',
        scoreboard: cacheLeaderboard,
    });
});