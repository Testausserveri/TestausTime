/*
 * Testausserveri.fi presents: TestausTime
 * Track the time you spent coding, with a cool leaderboard.
 */
import express from 'express';
import mongoose from 'mongoose';
import config from '../config.js';
import bearer from 'express-bearer-token'; 
import fs from 'fs';

import usersController from './controllers/users.js';
import heartbeatController from './controllers/heartbeat.js';

console.log('Connecting to the mongoDB');
try {
    await mongoose.connect(config.mongodb_connection_string, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    });
}
catch (error) {
    console.error(error);
    console.log('MongoDB connection failed');
    process.exit();
}
console.log('Connected to the MongoDB. Starting web server');

const app = express();
app.use(express.json());
app.use(bearer());

// Api endpoints
app.use('/api/users', usersController);
app.use('/api/heartbeat', heartbeatController);

// React content
app.use('/', express.static('../salmiakki/build/'));
app.use((req, res) => {
    res.sendFile('index.html', {root: '../salmiakki/build/'});
});

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Webserver up and running on port ${PORT}.`);
});
