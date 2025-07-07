import jwt from 'jsonwebtoken';
import User from '../model/User.model.js';
export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        message: "Unauthorized access, no token provided"
      });
    }
    try {
      const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decode.userId).select("-password -__v ");
      if (!user) {
        return res.status(401).json({
          message: "Unauthorized access, user not found"
        });
      }
      req.user = user; // Attach user to request object 
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: "Unauthorized access, token expired"
        });
      }
      throw error; // Re-throw other errors to be caught by the outer catch block
    }
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(401).json({
      message: "Unauthorized access",
      error: error.message,
    });
  }
}



export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed to the next middleware or route handler
  } else {
    return res.status(403).json({
      message: "Forbidden: You do not have permission to access this resource"
    });
  }
};