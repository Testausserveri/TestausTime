/*
 * Testausserveri.fi presents: TestausTime
 * Track the time you spent coding, with a cool leaderboard.
 */
import express from 'express';
import mongoose from 'mongoose';
import config from '../config.js';
import bearer from 'express-bearer-token'; 
import fs from 'fs';

console.log('Connecting to the mongoDB');
try {
    await mongoose.connect(config.mongodb_connection_string, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
}
catch (error) {
    console.error(error);
    console.log('MongoDB connection failed');
    process.exit();
}
export const database = mongoose;
console.log('Connected to the MongoDB. Starting web server');
const app = express();
app.use(express.json());
app.use(bearer());

// Load the routers.
fs.readdirSync('./src/routers/').forEach(async (file) => {
    if (file.split('.').pop() !== 'js')
        return;
    console.log(`Loading router ${file}`);
    const module = await import(`./routers/${file}`);
    app.use(module.route, module.router);
});

app.use('/', express.static(path.join(__dirname, '../salmiakki/build/')))

app.listen(80, () => {
    console.log('Webserver up and running on port 80');
});
