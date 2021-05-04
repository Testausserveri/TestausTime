import startServer from '../src/server';

/** Port number to use to make the operating system choose a free port. */
const OS_ASSIGN_RANDOM_PORT = 0;

/** Provided by @shelf/jest-mongodb for access to the test MongoDB instance */
const { MONGO_URL } = process.env;

describe('Server', () => {
    it('starts', async () => {
        const server = await startServer(OS_ASSIGN_RANDOM_PORT, MONGO_URL);
        await server.stop();
    });
});
