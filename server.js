import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
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
app.use(cors());


app.use('/api', userRoutes);


app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})




