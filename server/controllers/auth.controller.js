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

    const { accessToken, refreshToken } = generateTokens(user._id);
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

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // console.log(user.password);

    if (user && (await user.comparePassword(password))) {
      // User authenticated successfully
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookeis(res, accessToken, refreshToken);

    } else {
      // Authentication failed
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: error.message });
  }
}

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refreshToken:${decoded.user_id}`); // Remove the refresh token from Redis
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: error.message });

  }
}

//this is bascially refresh the asscess token.
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refreshToken:${decoded.user_id}`);
    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const accessToken = jwt.sign({ user_id: decoded.user_id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (error) {
    console.error("Error in refreshToken controller :", error.message);
    return res.status(500).json({ message: error.message });
  }

}

