import dotenv from 'dotenv';
import startServer from './server.js';

dotenv.config();

const port = process.env.PORT || 80;
const databaseUrl = process.env.MONGODB_URL;

if (!databaseUrl) {
    throw new Error('No database url provided.');
}

startServer(port, databaseUrl)
    .then((server) => {
        const address = server.server.address();
        console.log(`Serving on :${address.port}`);
    })
    .catch((error) => {
        console.error(`Failed to start the server:\n${error}`);
        process.exit(-1);
    });
