import { poolPromise, sql } from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";

// SIGNUP
export const registerUser = async (req, res) => {
  const { email, name, role, password } = req.body;

  try {
    const hashedPassword = await hashPassword(password);

    const pool = await poolPromise;

    // check existing user
    const existing = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT id FROM users WHERE email = @email");

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    await pool
      .request()
      .input("email", sql.VarChar, email)
      .input("name", sql.VarChar, name)
      .input("role", sql.VarChar, role)
      .input("password", sql.VarChar, hashedPassword).query(`
        INSERT INTO users (email, name, role, password)
        VALUES (@email, @name, @role, @password)
      `);

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
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.recordset[0];
    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // never return password
    delete user.password;

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
