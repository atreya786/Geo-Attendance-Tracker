import { db } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";

// SIGNUP
export const registerUser = async (req, res) => {
  const { email, name, role, password } = req.body;

  try {
    const hashed = await hashPassword(password);

    await db.query(
      "INSERT INTO users (email, name, role, password) VALUES (?, ?, ?, ?)",
      [email, name, role, hashed],
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Registration failed" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};
