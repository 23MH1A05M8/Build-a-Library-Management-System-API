const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Book = require("./Book");
const Member = require("./Member");

const Transaction = sequelize.define("Transaction", {
  borrowed_at: { type: DataTypes.DATE, allowNull: false },
  due_date: { type: DataTypes.DATE, allowNull: false },
  returned_at: { type: DataTypes.DATE, allowNull: true },
  status: {
    type: DataTypes.ENUM("active", "returned", "overdue"),
    defaultValue: "active",
  },
});

Transaction.belongsTo(Book, { foreignKey: "book_id" });
Transaction.belongsTo(Member, { foreignKey: "member_id" });

module.exports = Transaction;
