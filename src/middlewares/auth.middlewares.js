const userModel = require("../models/auth.models");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blackList.model");

async function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  const isBlackListed = await tokenBlackListModel.findOne({ token });

  if (isBlackListed) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
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

async function authSystemUserMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  const isBlackListed = await tokenBlackListModel.find({ token });

  if (isBlackListed) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(402).json({
        message: "You donn't have access",
      });
    }
    const user = await userModel.findById(decoded.id).select("+systemUser");
    console.log(user);
    if (!user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, not a system user",
      });
    }
    req.user = user;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }
}

module.exports = { authMiddleware, authSystemUserMiddleware };
