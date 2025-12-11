const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Book = sequelize.define("Book", {
  isbn: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  category: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM("available", "borrowed", "reserved", "maintenance"),
    defaultValue: "available",
  },
  total_copies: { type: DataTypes.INTEGER,   defaultValue: 1 },
  available_copies: { type: DataTypes.INTEGER,  defaultValue: 1},
});


Book.beforeCreate((book) => {
  book.available_copies = book.total_copies;
});

module.exports = Book;



