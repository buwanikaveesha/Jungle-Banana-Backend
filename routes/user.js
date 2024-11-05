import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import requireAuth from '../middleware/requireAuth.js';
import User from '../models/User.js';

dotenv.config();

const router = express.Router();

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
           
        });

        await newUser.save();
        return res.status(201).json({ status: true, message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: 'Error registering user', error });
    }
});

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


export default router;
