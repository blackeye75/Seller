import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
import authRoutes from './routes/auth.route.js'; // Importing the auth routes
import { connectDB } from './lib/db.js';

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies


app.use("/api/auth",authRoutes);


app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
  connectDB()
});