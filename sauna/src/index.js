/**
 * Backend services
 * (Following the structure of RaikasDev)
 */
// Dependencies
import express from 'express';
import mongoose from 'mongoose';
import bearer from 'express-bearer-token';
import fs from 'fs';

// Internal dependencies
import config from '../config.js';

// Global constants
const app = express();
const appPort = 80;
const routerLocation = './src/routers/';
const mongooseConfiguration = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
};

// Global variables
let databaseConnection = null;
// eslint-disable-next-line prefer-const
let routers = {};

// Establish database connection
// TODO: What value is exported? Null?
console.log('Connecting to MongoDB...');
try {
    await databaseConnection = mongoose.connect(config.mongodb_connection_string,
        mongooseConfiguration);
    console.log('Connected to MongoDB.');
} catch (err) {
    console.error('Failed to connect to MongoDB.\n', err);
    process.exit(-1);
}

export const database = databaseConnection;
// Create routers list
// eslint-disable-next-line no-new
await new Promise((resolve) => {
    fs.readdir(routerLocation, async (err, files) => {
        if (err != null) {
            console.error('Failed to get routers.\n', err);
        } else {
            // Any better way to do this?
            // eslint-disable-next-line no-restricted-syntax
            for (const file of files) {
                // Check filetype
                if (file.endsWith(".js") && fs.statSync(`./src/routers/${file}`).isFile()) {
                    console.log(`> Loading ${file}...`);
                    try {
                        // eslint-disable-next-line no-await-in-loop
                        const module = await import(`./routers/${file}`);
                        routers[module.route] = module.router
                        console.log(`> Loaded ${file}`);;
                    } catch (err2) {
                        console.error(`Failed to load ${file}.\n`, err2);
                        // Will not terminate
                    }
                }
            }
            resolve()
        }
    });
});
console.log(`Loaded ${Object.keys(routers).length} router modules in total. Starting webserver...`);

// Express webserver
app.use(express.json());
app.use(bearer());

// eslint-disable-next-line no-restricted-syntax, guard-for-in
for (const router in routers) { // Add in router modules
    app.use(router, routers[router]);
}

app.get('/', (req, res) => { // Default route
    res.status(200).json({
        message: 'Hello, the sauna is hot and running!',
    });
});
app.use((req, res) => { // 404 response
    res.status(404).send('No such file or route.');
});
app.listen(appPort, () => {
    console.log(`Webserver online in port ${appPort}.`);
});