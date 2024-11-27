import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import requireAuth from '../middleware/requireAuth.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

dotenv.config();

const router = express.Router();
const { JWT_SECRET } = process.env;

// Utility function for error handling
const handleError = (res, message, error, statusCode = 500) => {
    console.error(message, error);
    res.status(statusCode).json({ message, error: error?.message });
};

// Signup Route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            score: { easy: 0, medium: 0, hard: 0 },
        });

        await newUser.save();
        return res.status(201).json({ status: true, message: "User registered successfully" });
    } catch (error) {
        handleError(res, 'Error registering user', error);
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate token
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        // Set token in cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

        return res.status(200).json({ status: true, message: 'Login successful', token });
    } catch (error) {
        handleError(res, 'Error logging in', error);
    }
});

// Update Score Route
router.put('/score', requireAuth, async (req, res) => {
    const userId = req.user.id;
    const { score, level } = req.body;

    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        user.score[level] = (user.score[level] || 0) + score;

        await user.save();
        return res.status(200).json({ message: "Score updated", score: user.score });
    } catch (error) {
        handleError(res, "Failed to update score", error);
    }
});

// Leaderboard Route
router.get('/leaderboard', async (req, res) => {
    try {
        const levels = ['easy', 'medium', 'hard'];
        const leaderboard = {};

        for (const level of levels) {
            const users = await User.find().sort({ [`score.${level}`]: -1 });
            leaderboard[level] = users.map((user, index) => ({
                username: user.username,
                email: user.email,
                score: user.score[level] || 0,
                rank: index + 1,
            }));
        }

        res.json(leaderboard);
    } catch (error) {
        handleError(res, 'Error fetching leaderboard', error);
    }
});

// Get User Profile Route
router.get('/user/profile', requireAuth, async (req, res) => {
    try {

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const allUsers = await User.find();
        const rank = { easy: 1, medium: 1, hard: 1 };
        const sortedUsers = {
            easy: allUsers.sort((a, b) => b.score.easy - a.score.easy),
            medium: allUsers.sort((a, b) => b.score.medium - a.score.medium),
            hard: allUsers.sort((a, b) => b.score.hard - a.score.hard),
        };

        ['easy', 'medium', 'hard'].forEach((level) => {
            sortedUsers[level].forEach((u, idx) => {
                if (u._id.toString() === user._id.toString()) {
                    rank[level] = idx + 1;
                }
            });
        });

        res.json({
            username: user.username,
            email: user.email,
            rank,
            score: user.score,
        });
    } catch (error) {
        handleError(res, 'Error fetching user profile', error);
    }
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Validate email format (optional but recommended)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Generate the reset token using a static secret
        const secret = JWT_SECRET; // Use the static secret for signing
        const token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '5m' });

        // Construct the reset link
        const link = `http://localhost:3000/reset-password/${user._id}/${token}`;

        // Send the reset link via email
        await sendEmail(user.email, 'Password Reset Request', `Click this link to reset your password: ${link}`);

        // Respond to the client
        return res.status(200).json({ message: "Password reset link has been sent to your email." });
    } catch (error) {
        console.error("Error in forgot-password route:", error.message);
        return res.status(500).json({
            message: "Error generating reset password link",
            error: error.message,
        });
    }
});




// Reset Password Route
router.post('/reset-password/:id/:token', async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User does not exist!" });
        }

        const secret = JWT_SECRET + user.password;
        jwt.verify(token, secret);

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({ message: "Password has been reset successfully." });

    } catch (error) {
        
        return res.status(400).json({ message: "Invalid or expired token.", error: error.message });
    }
});


export default router;
