import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';

const router = express.Router();

// ---- AUTH & USER ROUTES ----

router.post('/auth/register', async (req, res) => {
    try {
        const { id, username, email, password } = req.body;
        const newId = id || crypto.randomUUID?.() || Date.now().toString();
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already in use' });

        const user = new User({ id: newId, username, email, password });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user profile
router.get('/users/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user profile (e.g. credits, purchases)
router.put('/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user profile by email (used by credits system)
router.put('/users/email/:email', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ email: req.params.email }, req.body, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- PROJECT ROUTES ----

router.get('/projects', async (req, res) => {
    try {
        const filter = {};
        if (req.query.ownerId) filter.ownerId = req.query.ownerId;
        if (req.query.status) filter.status = req.query.status;
        const projects = await Project.find(filter).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/projects', async (req, res) => {
    try {
        const data = { ...req.body };
        if (!data.id) data.id = crypto.randomUUID?.() || Date.now().toString();
        const project = new Project(data);
        await project.save();
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ id: req.params.id });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
