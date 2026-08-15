const express = require("express");
const authMiddleware = require("../middlewares/auth.middlewares");
const transactionControls = require("../controls/transaction.controls");

const router = express.Router();

router.post(
  "/",
  authMiddleware.authMiddleware,
  transactionControls.createTransaction,
);



module.exports = router;
