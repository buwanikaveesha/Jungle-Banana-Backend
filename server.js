import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import questionRoutes from './routes/question.js';
import userRoutes from './routes/user.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
let PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MY_DB_URL, {
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    console.error('Stack trace:', err.stack);
  });


app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(cookieParser());


app.use('/api', userRoutes);
app.use('/api', questionRoutes);

app.use(
  express.static(path.join(__dirname, '..', 'Jungle-Banana-Frontend', 'dist'), {
    setHeaders: (res, filePath) => {

      if (filePath.endsWith('.jsx')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    },
  })
);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'Jungle-Banana-Frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
