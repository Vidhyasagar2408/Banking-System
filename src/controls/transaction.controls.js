const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/accounts.model");
const emailService = require("../services/email.service");
const { default: mongoose } = require("mongoose");

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res) {
  /**
   * 1. Validate user
   */

  const { fromAccount, toAccount, amount, idemPotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idemPotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount, idemPotencyKey is required.",
    });
  }

  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  /**
   * 2. Validate idemPotencyKey
   */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idemPotencyKey: idemPotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still pending",
      });
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed, please retry",
      });
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  /**
   * 3. Check account status
   */

  if (fromUserAccount !== "ACTIVE" || toUserAccount !== "ACTIVE") {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE to process transactions",
    });
  }

  /**
   * 4. Derive sender balance from ledger
   */

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  /**
   * 5. Create transaction (PENDING)
   */

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      amount,
      idemPotencyKey,
      status: "PENDING",
    },
    { session },
  );

  /**
   * 6. Create DEBIT ledger entry
   */

  const debitLedgerEntry = await ledgerModel.create({
    account: fromAccount,
    amount: amount,
    transaction: transaction._id,
    type: "DEBIT",
  });

  /**
   * 7. Create CREDIT ledger entry
   */

  const creditLedgerEntry = await ledgerModel.create({
    account: fromAccount,
    amount: amount,
    transaction: transaction._id,
    type: "CREDIT",
  });

  /**
   * 8. Mark transaction COMPLETED
   */

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  /**
   * 9. Commit MongoDB session
   */

  await session.commitTransaction();
  session.endSession;

  /**
   * 10. Send email notification
   */

  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount,
  );

  res.status(201).json({
    message: "Transaction completed successully",
    transaction,
  });
}

module.exports = { createTransaction };
