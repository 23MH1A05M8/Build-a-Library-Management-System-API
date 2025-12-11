const express = require('express');
const app = express();

app.use(express.json());

// DB config and models
const { sequelize, testConnection } = require("./config/database");
const Book = require("./models/Book");
const Member = require("./models/Member");
const Transaction = require("./models/Transaction");
const Fine = require("./models/Fine");

// Routes
const bookRoutes = require("./routes/bookRoutes");
const memberRoutes = require("./routes/memberRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
// const reportRoutes = require("./routes/reportRoutes");
const overdueRoutes = require("./routes/overdueRoutes");
const fineRoutes = require("./routes/fineRoutes");
// Register routes
app.use("/books", bookRoutes);
app.use("/members", memberRoutes);
app.use("/transactions", transactionRoutes);
// app.use("/", reportRoutes); // for overdue transactions
app.use("/", overdueRoutes);
app.use("/", fineRoutes);   // for paying fines

app.get("/", (req, res) => {
  res.send("Library API is running...");
});



const syncModels = async () => {
  try {
    await sequelize.sync();
    console.log("Models synchronized with database!");
  } catch (err) {
    console.error("Error syncing models:", err);
  }
};

app.listen(3000, async () => {
  console.log("Server running on port 3000");
  await testConnection();  // test DB connection
  await syncModels();       // sync models
});
