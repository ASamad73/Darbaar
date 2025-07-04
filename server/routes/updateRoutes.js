import express from 'express';
import User from '../models/User.js';
import Friend from '../models/Friends.js'

const router = express.Router();

router.post('/user', async (req, res) => {
    try {
        const {username} = req.body

        const users=await User.find();
        
        for (let u of users){
            if(u.username===username){
                if (!u) {
                    return res.status(404).json({ message: 'User not found' });
                }
            
                res.status(200).json(u);

                break;
            }
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


router.post('/user/update-profile', async (req, res) => {
    try {
        const { username, check_username, password } = req.body;
        // const user = await User.findById(req.user.userId);
        const users=await User.find();
        
        for (let u of users){
            if(u.username===check_username){
                // console.log('username found', u.username)
                // user=u;
                if (!u) {
                    return res.status(404).json({ message: 'User not found' });
                }

                if (username) {
                    u.username = username;
                }
                
                if (!password || password.length<6) {
                    return res.status(400).json({ message: 'Password Invalid' });
                }
                u.password = password
        
                await u.save();
                
                res.status(200).json({message: 'Profile updated successfully'});
            }
    }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/friends', async (req, res) => {
    try {
        
        const { username } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const friends=await Friend.find({ user: user._id }).populate('friend', 'username games');

        res.json(friends);
        
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/add_friend', async (req, res) => {
    try {        
        const { friend, username } = req.body;

        if(!friend || !username){
            return res.status(400).json({message: 'friend or username is invalid'});
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'current user in friends doesn`t exist' });
        }

        const existing = await Friend.findOne({ user: user._id, friend: friend._id });
        if (existing) {
            return res.status(409).json({ message: 'Friend already added' });
        }

        const newFriend = new Friend({
            user: user._id,
            friend: friend._id
        });

        await newFriend.save();

        res.status(200).json({ message: 'Friend added successfully' });
        
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/game', async (req, res) => {
    try {        
        const { username } = req.body;

        if(!username){
            return res.status(400).json({message: 'username in updating games is invalid'});
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'User in updating games not found' });
        }

        const curr_games=user.games;
        user.games=curr_games+1;

        await user.save();

        res.status(200).json({ message: 'Games updated successfully'});
        
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


export default router;
