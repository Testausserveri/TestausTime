import express from 'express';
import { registerUser, getUserById, getUserByAPIKey } from '../../database.js';
export const route = '/user';
export const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'Users working'
    });
});

router.post('/register', async (req, res) => {
    if (!req.body.id) {
        res.status(400).json({
            message: 'User id not supplied',
            apiKey: user.apiKey,
            took: Date.now() - start + 'ms'
        });
    }
    let user = await registerUser({ userID: req.body.id });
    if (!user) {
        res.status(409).json({
            message: 'User register failed. Username already exists',
            took: Date.now() - start + 'ms'
        });
    }
    res.json({
        message: 'User registered',
        apiKey: user.apiKey,
    });
});

router.get('/:userid', async (req, res) => {
    const user = await getUserById(req.params.userid);
    res.json({
        message: 'OK',
        cooldown: user.hasCooldown(),
        totalTime: user.getTotalTime()
    });
});

router.post('/validAPIKey', async (req, res) => {
    if (!req.token) {
        return res.status(400).json({
            message: 'Missing Bearer.',
            valid: false,
        });
    }
    const user = await getUserByAPIKey(req.token);
    if(!user) {
        return res.status(400).json({
            message: 'API key not valid',
            valid: false,
        });
    }
    res.json({
        message: 'API Key valid',
        cooldown: user.hasCooldown(),
        valid: true
    });
});

router.put('/addTime', async (req, res) => {
    if (!req.token || !req.body.time || !req.body.editor || !req.body.project) {
        return res.status(400).json({
            message: 'Invalid query.',
        });
    }
    const user = await getUserByAPIKey(req.token);
    if(!user) {
        return res.status(400).json({
            message: 'API key not valid',
        });
    }
    if (user.hasCooldown()) {
        return res.status(429).json({
            message: 'Cooldown',
        });
    }
    if(typeof req.body.time === 'string') {
        if (isNaN(req.body.time)) {
            return res.status(400).json({
                message: 'Invalid request',
            });
        }
        req.body.time = parseInt(req.body.time);
    }
    const result = user.addTime(req.body.time, req.body.project, req.body.editor);
    
    if (result) { 
        res.json({
            message: 'OK',
        });
    } else {
        res.status(400).json({
            message: 'Failed or too big value.',
        });
    }
});
