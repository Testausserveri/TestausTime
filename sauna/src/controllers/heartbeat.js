import express from 'express';
import mongoose from 'mongoose';

import User from '../models/user.js';
import ProjectEdit from '../models/editedProject.js';

const router = express.Router();

const apiVersion = 1;

const pushIfNotExists = (arr, val) => !arr.includes(val) && arr.push(val);

/** Endpoint for saving IDE heartbeats. */
router.post('/', async (req, res) => {
    try {
        if (!req.token) return res.status(400);

        const userWithEdits = await User.findOne({ apiKey: req.token }).populate('editedProjects');
        if (!userWithEdits) return res.status(403);

        const {
            test = false,
            project = null,
            editor = null,
            totalTime = null,
        } = req.body;

        if (test) return res.json({ version: `v${apiVersion}` });

        if (typeof totalTime !== 'number' || totalTime < 2 || totalTime > 5 * 60) return res.status(400).send({ error: 'Invalid body.' });

        const date = new Date();
        const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        const projectMatch = userWithEdits.editedProjects
            .find((e) => (e.day === day && e.project === project));

        const user = userWithEdits.depopulate('editedProjects');

        if (projectMatch) {
            pushIfNotExists(projectMatch.editors, editor);
            pushIfNotExists(projectMatch.hours, date.getHours());

            projectMatch.totalTime += totalTime;

            await projectMatch.save();
        } else {
            const editedProject = new ProjectEdit({
                user: user._id,
                editors: [editor],
                hours: [date.getHours()],
                day,
                project,
                totalTime,
            });

            await editedProject.save();

            user.editedProjects = [editedProject._id, ...user.editedProjects];
        }

        await user.save();

        return res.status(200);
    } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
            return res.status(400).send({ error: e.errors[0].message || e.message });
        }

        return res.status(500);
    }
});

export default router;
