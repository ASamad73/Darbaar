import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from "dotenv";

config({ path: "./config.env" });

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required fields' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = new User({ username, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '3d' } 
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 3 * 24 * 60 * 60 * 1000, 
    });

    return res.status(201).json({ message: 'Signup successful' });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'SignUp error', error: error.message });
  }
});


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });

        const user = await User.findOne({ username });
        if (!user)
        return res.status(400).json({ message: 'Username does not exist' });

        const passwordCheck = password === user.password;
        if (!passwordCheck)
        return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
        );

        res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 3 * 24 * 60 * 60 * 1000, 
        });

        res.status(200).json({ message: 'Login successful' });

    } catch (error) {
        res.status(500).json({ message: 'Login error', error: error.message });
    }
});

export default router;