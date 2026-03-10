const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Item = sequelize.define('Item', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, hidden: true },
  orderId: { type: DataTypes.STRING, references: { model: "Order", key: 'orderId' } },
  productId: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  price: { type: DataTypes.FLOAT }
}, { 
  timestamps: false,
  tableName: 'Items' 
});

module.exports = Item;
