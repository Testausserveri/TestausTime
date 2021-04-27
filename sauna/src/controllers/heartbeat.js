import { Router } from 'express';
import User from '../models/user.js';
import ProjectEdit from '../models/editedProject.js';

const router = Router();

/** Endpoint for saving IDE heartbeats. */
router.post('/', async (req, res) => {
    if (!req.token) return res.status(400);

    const user = await User.findOne({
        apiKey: req.token,
    }).populate('editedProjects');
    if (!user) return req.sendStatus(403);

    const { test, project, editor } = req.body;

    if (test) return res.json({ version: 'v1' });

    const date = new Date();
    const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    const projectMatch = user.editedProjects
        .find((e) => (e.day === day && e.project === project));

    const depopulated = user.depopulate('editedProjects');

    if (projectMatch) {
        if (!projectMatch.editors.includes(editor)) projectMatch.editors.push(editor);

        if (!projectMatch.hours.includes(date.getUTCHours())) {
            projectMatch.hours.push(date.getHours());
        }

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

        depopulated.editedProjects = [editedProject._id, ...depopulated.editedProjects];
    }

    await depopulated.save();
    return res.status(200);
});

export default router;
