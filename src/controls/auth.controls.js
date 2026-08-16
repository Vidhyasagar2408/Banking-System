const userModel = require("../models/auth.models");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model");

async function registerUser(req, res) {
  const { email, name, password } = req.body;

  const isEmailExists = await userModel.findOne({
    email: email,
  });

  if (isEmailExists) {
    return res.status(422).json({
      message: "User already exists with this email",
      status: "Failed",
    });
  }

  const user = await userModel.create({
    email,
    name,
    password,
  });

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "User created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });

  await emailService.sendRegistrationEmail(user.email, user.name);
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      message: "Email is invalid",
    });
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(401).json({
      message: "Password is invalid",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "3d",
    },
  );

  res.cookie("token", token);

  res.status(200).json({
    message: "User loggedIn successfully",
    user,
  });
}

async function logoutUser(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(200).json({
      message: "User logged out successfully",
    });
  }

  await tokenBlackListModel.create({
    token,
  });

  res.clearCookie("token");

  res.status(200).json({
    message: "User logged out successfully",
  });
}

module.exports = { registerUser, loginUser, logoutUser };
