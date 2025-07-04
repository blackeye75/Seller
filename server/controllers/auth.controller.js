import User from "../model/User.model.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const user = await User.create({ email, password, name });
  return res.status(201).json({ user, message: "User created successfully" });
}

export const login = async (req, res) => {
  res.send('login Page');
}

export const logout = async (req, res) => {
  res.send('logout Page');
}