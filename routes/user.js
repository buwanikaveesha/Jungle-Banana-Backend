import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import requireAuth from '../middleware/requireAuth.js';
import User from '../models/User.js';

dotenv.config();

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashpassword,
            score: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            rank: 'Beginner', // Default rank
        });

        await newUser.save();
        return res.status(201).json({ status: true, message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: 'Error registering user', error });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

        return res.status(200).json({ status: true, message: 'Login successful', token });
    } catch (error) {
        return res.status(500).json({ message: 'Error logging in', error });
    }
});

// Update Score Route
router.put('/score', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { score, level } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        
        user.score[level] = (user.score[level] || 0) + score;


        await user.save();

        res.status(200).json({ message: "Score updated", score: user.score });
    } catch (error) {
        res.status(500).json({ error: "Failed to update score", details: error.message });
    }
});

// Leaderboard Route
router.get('/leaderboard', async (req, res) => {
    try {
        const modes = ['easy', 'medium', 'hard'];
        const leaderboard = {};

        for (const level of modes) {
            const users = await User.find().sort({ [`score.${level}`]: -1 });
            leaderboard[level] = users.map((user, index) => ({
                username: user.username,
                email: user.email,
                score: user.score[level],
                rank: index + 1
            }));
        }

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard', error });
    }
});

// Get User Profile Route
router.get('/user/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all users to calculate rankings
        const allUsers = await User.find();

        // Initialize rank object for the current user
        const rank = {
            easy: 1,
            medium: 1,
            hard: 1,
        };

        // Create separate sorted copies for each mode
        const sortedUsers = {
            easy: [...allUsers].sort((a, b) => b.score.easy - a.score.easy),
            medium: [...allUsers].sort((a, b) => b.score.medium - a.score.medium),
            hard: [...allUsers].sort((a, b) => b.score.hard - a.score.hard),
        };

        // Assign rank to the user in each mode
        sortedUsers.easy.forEach((userInMode, index) => {
            if (userInMode._id.toString() === user._id.toString()) {
                rank.easy = index + 1;
            }
        });

        sortedUsers.medium.forEach((userInMode, index) => {
            if (userInMode._id.toString() === user._id.toString()) {
                rank.medium = index + 1;
            }
        });

        sortedUsers.hard.forEach((userInMode, index) => {
            if (userInMode._id.toString() === user._id.toString()) {
                rank.hard = index + 1;
            }
        });

        // Return profile data, including rank for each mode and score
        res.json({
            username: user.username,
            email: user.email,
            rank: rank, // Rank for each mode
            score: user.score,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;
