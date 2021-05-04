/*
 * Testausserveri.fi presents: TestausTime
 * Track the time you spent coding, with a cool leaderboard.
 */
import express from 'express';
import bearer from 'express-bearer-token';
import mongoose from 'mongoose';
import { promisify } from 'util';

import usersController from './controllers/users.js';
import heartbeatController from './controllers/heartbeat.js';

const app = express();

app.use(express.json());
app.use(bearer());

// REST API endpoints
app.use('/api/users', usersController);
app.use('/api/heartbeat', heartbeatController);

// TODO: Move error handling into a middleware here, if by any means possible

const startServer = async (port, databaseUrl) => {
    console.log('Connecting to database...');

    const session = await mongoose.connect(databaseUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    });

    session.connection
        .on('disconnected', () => console.log('Disconnected from database. Reconnecting....'))
        .on('reconnectFailed', () => {
            console.log('Disconnected and unable to reconnect to database.');
            process.exit(-1);
        });

    console.log('Connected to database.');

    const server = await new Promise((resolve, reject) => {
        try {
            const serverInstance = app.listen(port, () => resolve(serverInstance));
        } catch (error) {
            reject(error);
        }
    });

    // return object with all necessary information to control
    // and stop the server if needed
    return {
        app,
        server,
        stop: async () => {
            await promisify(server.close.bind(server))();
            return session.disconnect();
        },
    };
};

export default startServer;
