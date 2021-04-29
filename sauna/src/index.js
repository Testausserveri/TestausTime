/*
 * Testausserveri.fi presents: TestausTime
 * Track the time you spent coding, with a cool leaderboard.
 */
import express from 'express';
import bearer from 'express-bearer-token';
import dotenv from 'dotenv';

import usersController from './controllers/users.js';
import heartbeatController from './controllers/heartbeat.js';

const port = process.env.PORT || 80;
const databaseUrl = process.env.MONGODB_URL;

dotenv.config();

console.log('Connecting to database.');
await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
})
    .then(console.log('Connected to MongoDB database.'))
    .catch((e) => {
        console.log('Could not connect to MongoDB database: ', e);
        process.exit();
    });

const app = express();
app.use(express.json());
app.use(bearer());

// REST API endpoints
app.use('/api/users', usersController);
app.use('/api/heartbeat', heartbeatController);

// React content
app.use('/', express.static('../salmiakki/build/'));
app.use((_, res) => res.sendFile('index.html', {root: '../salmiakki/build/'}));

app.listen(port, () => {
    console.log(`Webserver up and running on port ${port}.`);
});
