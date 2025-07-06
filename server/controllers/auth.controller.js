import { redis } from "../lib/redis.js";
import User from "../model/User.model.js";
import jwt from "jsonwebtoken";

const generateTokens = (user_id) => {
  const accessToken = jwt.sign({ user_id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ user_id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
}

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refreshToken:${userId}`, refreshToken, 'EX', 60 * 60 * 24 * 7); // Store for 7 days
}


const setCookeis = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "Strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  res.cookie("userId", accessToken.user_id, {});
}



export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, name });

    //authenticate

    const { accessToken, refreshToken } = generateTokens(user_id);
    await storeRefreshToken(user._id, refreshToken);
    setCookeis(res, accessToken, refreshToken);


    return res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }, message: "User created successfully"
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: error.message });
  }
}

export const login = async (req, res) => {
  const { email, pasword } = req.body;
}

export const logout = async (req, res) => {
  res.send('logout Page');
}