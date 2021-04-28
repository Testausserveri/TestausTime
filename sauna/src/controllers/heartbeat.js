import { Router } from 'express';
import User from '../models/user.js';
import ProjectEdit from '../models/editedProject.js';

const apiVersion = 1;

const pushIfNotExists = (arr, val) => !arr.includes(val) && arr.push(val);

const router = Router();

/** Endpoint for saving IDE heartbeats. */
router.post('/', async (req, res) => {
    if (!req.token) return res.status(400);

    const userWithEdits = await User.findOne({ apiKey: req.token }).populate('editedProjects');
    if (!userWithEdits) return res.status(403);

    const { test = false, project = null, editor = null } = req.body;
    if (!project || !editor) return res.status(400);

    if (test) return res.json({ version: `v${apiVersion}` });

    const date = new Date();
    const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    const projectMatch = userWithEdits.editedProjects
        .find((e) => (e.day === day && e.project === project));

    const user = userWithEdits.depopulate('editedProjects');

    if (projectMatch) {
        pushIfNotExists(projectMatch.editors, editor);
        pushIfNotExists(projectMatch.hours, date.getHours());

        projectMatch.totalTime += 2;

        const saveSuccess = await projectMatch.save();
        if (!saveSuccess) return res.status(400);
    } else {
        const editedProject = new ProjectEdit({
            day,
            user: user._id,
            project,
            editors: [editor],
            hours: [date.getHours()],
            totalTime: 2,
        });

        const saveSuccess = await editedProject.save();
        if (!saveSuccess) return res.status(400);

        user.editedProjects = [editedProject._id, ...user.editedProjects];
    }

    await user.save();
    return res.status(200);
});

export default router;
