import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/signup', async (req, res)=>{
    try{
        console.log('inside signup')
        const {username, password} = req.body;
    
        if (!username || !password){
            return res.status(400).json({message: 'Username and password are required fields'});
        }
    
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        
        if(password.length<6){
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
    
        const user = new User({
            username,
            password
          });
        await user.save();
    
        res.status(201).json({ message: `SignUp successful ${user._id}`, userId: user._id });
    } catch(error){
        res.status(500).json({message:'SignUp error', error: error.message});
    }
});

router.post('/login', async (req, res)=>{
    try{
        const {username, password} = req.body;
    
        if (!username || !password){
            return res.status(400).json({message: 'Username and password are required field'});
        }
    
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(400).json({ message: 'Username does nto exist' });
        }
        
        const passwordCheck = password===user.password;
        if (!passwordCheck) {
          return res.status(400).json({ message: 'Invalid password' });
        }
        
        res.status(200).json({ message: 'Login successful',  userId: user._id });
    } catch(error){
        res.status(500).json({message: 'Login error', error: error.message});
    }
});

export default router;