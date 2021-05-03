/*
 * Testausserveri.fi presents: TestausTime
 * Track the time you spent coding, with a cool leaderboard.
 */
import express from 'express';
import bearer from 'express-bearer-token';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import usersController from './controllers/users.js';
import heartbeatController from './controllers/heartbeat.js';

dotenv.config();

const port = process.env.PORT || 80;
const databaseUrl = process.env.MONGODB_URL;

const app = express();

app.use(express.json());
app.use(bearer());

// REST API endpoints
app.use('/api/users', usersController);
app.use('/api/heartbeat', heartbeatController);

// TODO: Move error handling into a middleware here, if by any means possible

// React content
app.use('/', express.static('../salmiakki/build/'));
app.use((_, res) => res.sendFile('index.html', { root: '../salmiakki/build/' }));

console.log('Connecting to database...');

// Top-level await is not in the specification just yet
(async () => {
    try {
        if (!databaseUrl) throw new Error('No database url provided.');

        const session = await mongoose.connect(databaseUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });

        console.log('Connected to database.');

        app.listen(port, () => {
            console.log(`Webserver up and running on port ${port}.`);
        });

        session.connection
            .on('disconnected', () => console.warn('Disconnected from database. Reconnecting....'))
            .on('reconnectFailed', () => {
                console.log('Disconnected and unable to reconnect to database.');
                process.exit(-1);
            });
    } catch (err) {
        console.log(`Failed to connect to database:\n${err}`);
        process.exit(-1);
    }
})();
