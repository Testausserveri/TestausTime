import express from 'express';
import fs from 'fs';
export const route = '/api';
export const router = express.Router();
router.get('/', (request, response) => {
    response.json({ status: 200, message: 'API Running', versionsSupported: ['v1'] });
});
fs.readdirSync('./src/routers').forEach(async (folder) => {
    if (folder.split('.').length !== 1)
        return;
    console.log(`Loading API version ${folder}`);
    const versionRouter = express.Router();
    versionRouter.get('/', (req, res) => {
        res.json({
            status: 200,
            message: `Sauna API version ${folder} running!`
        });
    });
    fs.readdirSync(`./src/routers/${folder}`).forEach(async (file) => {
        if (file.split('.').pop() !== 'js')
            return;
        console.log(`API Version ${folder}: Registering router ${file}`);
        const module = await import(`./${folder}/${file}`);
        versionRouter.use(module.route, module.router);
    });
    router.use(`/${folder}`, versionRouter);
});