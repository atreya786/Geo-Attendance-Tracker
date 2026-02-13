import User from "../models/User.js";

export const getAllEmployees = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .select("-profileImage")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.log("Error fetching employees", error);
    res.status(500).json({ message: "Failed to retrieve employees" });
  }
};
