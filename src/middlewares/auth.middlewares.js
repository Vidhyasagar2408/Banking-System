const userModel = require("../models/auth.models");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(402).json({
        message: "You donn't have access",
      });
    }
    const user = await userModel.findById(decoded.id);
    req.user = user;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }
}

module.exports = { authMiddleware };
