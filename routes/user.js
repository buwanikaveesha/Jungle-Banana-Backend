import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
dotenv.config();

const router = express.Router();


router.post('/signup', async (req, res) => {

    const { username, email, password } = req.body;
    const user = await User.findOne({email});

    if(user){
        return res.json({message: 'user already existed'});
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashpassword
    })

    await newUser.save();
    return res.json({status: true, message: "user record registed"});
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

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
        res.cookie('token', token, { httpOnly: true , maxAge: 360000})
        
    return res.json({ status: true, message: 'Login successful' });
});


export default router;
