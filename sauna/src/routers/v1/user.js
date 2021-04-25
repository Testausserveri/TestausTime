import express from 'express';
import fetch from 'node-fetch';
import config from '../../../config.js';
import { registerUser, getUserById, getUserByAPIKey } from '../../database.js';
export const route = '/user';
export const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'Users working'
    });
});


// Discord oauth
router.get('/register', async (req, res) => {
    if (!req.query.code) {
        res.status(400).json({
            message: 'Code not supplied',
        });
    }
    try {
        const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: config.discord_client_id,
                client_secret: config.discord_client_secret,
                code: req.query.code,
                grant_type: 'authorization_code',
                redirect_uri: config.discord_redirect_uri,
                scope: 'identify',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const oauthData = await oauthResult.json();
        if (oauthData.error) {
            return res.status(400).json({
                message: 'Error. Code expired',
            });
        }
        const { access_token, refresh_token, token_type} = oauthData;
        const userResult = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${token_type} ${access_token}`,
            },
        });

        const userInfo = await userResult.json();
        let user = await registerUser({ userID: userInfo.id, accessToken: access_token, refreshToken: refresh_token, tokenType: token_type });
        if (!user) {
            return res.status(409).json({
                message: 'User register failed. User with that ID already exists',
            });
        }
        res.json({
            message: 'User registered',
            apiKey: user.apiKey,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error',
        });
    }
});

router.get('/:userid', async (req, res) => {
    const user = await getUserById(req.params.userid);
    res.json({
        message: 'OK',
        cooldown: user.hasCooldown(),
        totalTime: user.getTotalTime()
    });
});

router.post('/validateAPIKey', async (req, res) => {
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
