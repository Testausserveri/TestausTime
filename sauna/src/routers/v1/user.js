import express from 'express';
import { registerUser, getUserById, getUserByAPIKey } from '../../database.js';
export const route = '/user';
export const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'Users working'
    });
});

router.post('/register', async (req, res) => {
    const start = Date.now();
    if (!req.body.id) throw new Error('No body id.');
    let user = await registerUser({ userID: req.body.id });
    if (!user) {
        res.status(409).json({
            status: 409,
            message: 'User register failed. Username already exists',
            took: Date.now() - start + 'ms'
        });
    }
    res.json({
        status: 200,
        message: 'User registered',
        apiKey: user.apiKey,
        took: Date.now() - start + 'ms'
    });
});

router.get('/:userid', async (req, res) => {
    const user = await getUserById(req.params.userid);
    res.json({
        status: 200,
        message: '',
        cooldown: user.hasCooldown(),
        totalTime: user.getTotalTime()
    });
});

router.post('/validAPIKey', async (req, res) => {
    if (!req.token) {
        return res.status(400).json({
            status: 400,
            message: 'Missing Bearer.',
            valid: false,
        });
    }
    const user = await getUserByAPIKey(req.token);
    if(!user) {
        return res.status(400).json({
            status: 400,
            message: 'API key not valid',
            valid: false,
        });
    }
    res.json({
        status: 200,
        message: 'API Key valid',
        cooldown: user.hasCooldown(),
        valid: true
    });
});

router.put('/addTime', async (req, res) => {
    if (!req.token || !req.body.time || !req.body.editor || !req.body.project) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid query.',
        });
    }
    const user = await getUserByAPIKey(req.token);
    if(!user) {
        return res.status(400).json({
            status: 400,
            message: 'API key not valid',
        });
    }
    if (user.hasCooldown()) {
        return res.status(429).json({
            status: 429,
            message: 'Cooldown',
        });
    }
    if(typeof req.body.time === 'string') {
        if (isNaN(req.body.time)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid request',
            });
        }
        req.body.time = parseInt(req.body.time);
    }
    const result = user.addTime(req.body.time, req.body.project, req.body.editor);
    
    if (result) { 
        res.json({
            status: 200,
            message: 'OK',
        });
    } else {
        res.status(400).json({
            status: 400,
            message: 'Failed or too big value.',
        });
    }
});
