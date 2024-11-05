import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    score: {
        easy: {
            type: Number,
            default: 0
        },
        medium: {
            type: Number,
            default: 0
        },
        hard: {
            type: Number,
            default: 0
        }
    }

})


export default mongoose.model('users', UserSchema);