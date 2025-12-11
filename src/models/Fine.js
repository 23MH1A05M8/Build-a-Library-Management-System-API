const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Member = require("./Member");
const Transaction = require("./Transaction");

const Fine = sequelize.define("Fine", {
  amount: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
 paid_at: {
  type: DataTypes.DATE,
  allowNull: true,
  defaultValue: null
}

});

Fine.belongsTo(Member, { foreignKey: "member_id" });
Fine.belongsTo(Transaction, { foreignKey: "transaction_id" });

module.exports = Fine;


