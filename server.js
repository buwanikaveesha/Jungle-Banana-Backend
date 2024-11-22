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
let PORT = process.env.PORT || 3000; // Use environment variable for PORT if available

// Connect to MongoDB
mongoose
  .connect(process.env.MY_DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err);
  });

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173'], // Adjust to match your frontend origin
    credentials: true,
  })
);
app.use(cookieParser());

// API Routes
app.use('/api', userRoutes);
app.use('/api', questionRoutes);

// Serve static files from the built frontend (dist folder)
app.use(
    express.static(path.join(__dirname, '..', 'Jungle-Banana-Frontend', 'dist'), {
      setHeaders: (res, filePath) => {
        // Correct MIME type for .jsx files
        if (filePath.endsWith('.jsx')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
      },
    })
  );
  
  // Handle all other routes by serving the React app's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'Jungle-Banana-Frontend', 'dist', 'index.html'));
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
