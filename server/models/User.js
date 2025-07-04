import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    games: {
        type:Number,
        default:0,
    }

}, { timestamps: true });

export default mongoose.model('User', userSchema);
