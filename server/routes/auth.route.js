import express from 'express';
import { getProfile, login, logout, refreshToken, signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup',signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken); // Assuming you have a refreshToken function defined
router.get('/profile',getProfile)

export default router;