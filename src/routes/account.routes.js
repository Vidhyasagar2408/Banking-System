const express = require("express");
const accountModel = require("../models/accounts.model");
const authMiddleware = require("../middlewares/auth.middlewares");
const accountControls = require("../controls/account.controls");

const router = express.Router();

router.post("/", authMiddleware.authMiddleware, accountControls.createAccount);

router.get("/", authMiddleware.authMiddleware, accountControls.getUserAccount);

router.get(
  "/balance/:accountId",
  authMiddleware.authMiddleware,
  accountControls.getAccountBalance,
);

module.exports = router;
