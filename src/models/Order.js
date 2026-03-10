const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define('Order', {
  orderId: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.FLOAT },
  creationDate: { type: DataTypes.DATE }
}, { 
  timestamps: false,
  tableName: 'Order' // Garante o nome exato da tabela
});

module.exports = Order;

/*

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define('Order', {
  orderId: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.FLOAT },
  creationDate: { type: DataTypes.DATE }
}, { timestamps: false });

module.exports = Order; */