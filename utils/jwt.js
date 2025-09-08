import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

//generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

//verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

//extract user from token
export const getUserFromToken = (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return null;
  return verifyToken(token);
  try {
    return verifyToken(token);
  } catch (error) {
    console.error("Error extracting user from token:", error);
    return null;
  }
};
