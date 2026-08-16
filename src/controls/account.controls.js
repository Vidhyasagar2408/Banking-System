const accountModel = require("../models/accounts.model");
const emailServices = require("../services/email.service");

async function createAccount(req, res) {
  const user = req.user;
  const account = await accountModel.create({
    user: user._id,
  });
  res.status(201).json({
    message: "Account created successfully",
    account,
  });

  await emailServices.sendAccountCreationEmail(user.email, user.name);
}

async function getUserAccount(req, res) {
  const accounts = await accountModel.findOne({ user: req.user._id });

  res.status(200).json({
    accounts,
  });
}

async function getAccountBalance(req, res) {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id,
  });

  if (!account) {
    return res.status(404).json({
      message: "Account not found",
    });
  }

  const balance = await account.getBalance();

  res.status(200).json({
    accountId: account._id,
    balance,
  });
}

module.exports = { createAccount, getUserAccount, getAccountBalance };
