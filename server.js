import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import questionRoutes from './routes/question.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
let PORT = 3000;


mongoose.connect(process.env.MY_DB_URL)
.then(() => {
    console.log("Connected to mongodb");
})
.catch(err => {
    console.log(err);
})


app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));
app.use(cookieParser());


app.use('/api', userRoutes);
app.use('/api', questionRoutes);



app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})




