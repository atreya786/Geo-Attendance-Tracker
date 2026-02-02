import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";

// SIGNUP
export const registerUser = async (req, res) => {
  const { email, name, role, password } = req.body;

  try {
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    await User.create({
      email,
      name,
      role,
      password: hashedPassword,
    });

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    delete user.password;

    user.id = user._id;
    delete user._id;

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
