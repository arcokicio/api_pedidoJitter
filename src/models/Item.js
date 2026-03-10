const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Item = sequelize.define('Item', {
  // A PK oculta é necessária para o Sequelize, mas as colunas visíveis serão as exigidas
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, hidden: true },
  orderId: { type: DataTypes.STRING, references: { model: "Order", key: 'orderId' } },
  productId: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  price: { type: DataTypes.FLOAT }
}, { 
  timestamps: false,
  tableName: 'Items' // Garante o nome exato da tabela
});

module.exports = Item;

/*

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Item = sequelize.define('Item', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.STRING, references: { model: "Order", key: 'orderId' } },
  productId: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  price: { type: DataTypes.FLOAT }
}, { timestamps: false });

module.exports = Item; */