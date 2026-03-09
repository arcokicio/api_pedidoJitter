const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Item = sequelize.define('Item', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.STRING, references: { model: Order, key: 'orderId' } },
  productId: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  price: { type: DataTypes.FLOAT }
}, { timestamps: false });

module.exports = Item;