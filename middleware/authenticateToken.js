import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  // Try to get token from cookie first, then from header
  const token =
    req.cookies?.token ||
    (req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1]);

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};
