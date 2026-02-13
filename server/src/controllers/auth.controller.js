import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// SIGNUP (Register)
export const registerUser = async (req, res) => {
  const { email, number, name, role, password, department, profileImage } =
    req.body;

  try {
    const existing = await User.findOne({ $or: [{ email }, { number }] });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    await User.create({
      email,
      number,
      name,
      role,
      department,
      password: hashedPassword,
      profileImage: profileImage || "",
    });

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, number, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email }, { number }] }).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    delete user.password;
    user.id = user._id;
    delete user._id;

    res.json({
      token,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
