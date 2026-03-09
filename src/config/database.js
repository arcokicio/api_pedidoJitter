// conf bd (sql+sequeliza)
// './database.sqlite'
//  ativar logging para depuração
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite', logging: false });
module.exports = sequelize;