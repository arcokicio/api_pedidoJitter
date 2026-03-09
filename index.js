// imports e configs 
// jwt autenticação e swagger para documentação, etc.
// dependencias necessárias para o projeto: pm install express sequelize sqlite3 jsonwebtoken swagger-ui-express swagger-jsdoc
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');


// run :3000
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
  console.log('📄 Swagger Docs: http://localhost:3000/api-docs');
});