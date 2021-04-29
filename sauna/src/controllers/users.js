import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';

import User from '../models/user.js';

const router = express.Router();

const countTotalTime = (u) => u.editedProjects.reduce((a, c) => (a + c.totalTime), 0);

/** Our global leaderboard. */
router.get('/leaderboard', async (req, res) => {
    const users = await User.find({})
        .populate('editedProjects');

    const sortedUsers = users.sort((a, b) => countTotalTime(b) - countTotalTime(a)).splice(0, 10);

    return res.json(sortedUsers.map((u) => ({
        discordId: u.discordId,
        totalTime: countTotalTime(u),
    })));
});

/** We use a Discord oAuth for authenticating users. */
router.get('/register', async (req, res) => {
    // Mock data
    const user = new User({
        discordId: crypto.randomBytes(24).toString('hex'),
        apiKey: crypto.randomBytes(24).toString('hex'),
        editedProjects: [],
    });

    await user.save();

    return res.json({
        id: user._id,
        apiKey: user.apiKey,
    });
});

// POST /login

/** Require given user to exist */
router.use('/:id', async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send('Invalid type object id.');
    }
    return next();
});

/** Query data for user */
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).populate('editedProjects');
    if (!user) return res.status(403);

    let totalTime = 0;

    const projects = user.editedProjects.reduce((a, e) => {
        totalTime += e.totalTime;
        // eslint-disable-next-line no-param-reassign
        a[e.project] = {
            totalTime: (a[e.project]) ? (a[e.project].totalTime + e.totalTime) : e.totalTime,
        };

        return a;
    }, {});

    return res.json({
        discordId: user.discordId,
        apiKey: user.apiKey,
        totalTime,
        projects,
    });
});

export default router;
