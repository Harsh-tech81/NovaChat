import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  try {
    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token", success: false });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found", success: false });
    }
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Not authorized, invalid token", success: false });
  }
};
