const express = require("express");
const authRouter = require("../src/routes/auth.routes");
const cookieParser = require("cookie-parser");
const accountRouter = require("./routes/account.routes");
const trasactionRoutes = require("./routes/transaction.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/transaction", trasactionRoutes);

module.exports = app;
