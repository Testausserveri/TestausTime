/*
 * Testausserveri.fi presents: TestausTime
 * Track the time you spent coding, with a cool leaderboard.
 */
import express from 'express';
import bearer from 'express-bearer-token';

import connectDatabase from './util/connectDatabase.js';
import usersController from './controllers/users.js';
import heartbeatController from './controllers/heartbeat.js';

const port = 8080;

console.log('Connecting to database.');
await connectDatabase();

const app = express();
app.use(express.json());
app.use(bearer());

// REST API endpoints
app.use('/api/users', usersController);
app.use('/api/heartbeat', heartbeatController);

// React content
app.use((_, res) => res.sendFile('index.html', {root: '../salmiakki/build/'}));
app.use('/', express.static('../salmiakki/build/'));

app.listen(port, () => {
    console.log(`Webserver up and running on port ${port}.`);
});
