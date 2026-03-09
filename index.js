const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jwt = require('jsonwebtoken');

// Importando Configurações e Rotas
const sequelize = require('./src/config/database');
const Order = require('./src/models/Order');
const Item = require('./src/models/Item');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();
app.use(express.json());

// Associações do Banco de Dados
Order.hasMany(Item, { foreignKey: 'orderId', as: 'items' });
Item.belongsTo(Order, { foreignKey: 'orderId' });

// Sincronizando o Banco (Cria as tabelas automaticamente)
sequelize.sync().then(() => console.log("✅ Banco de dados SQLite sincronizado!"));

// Configuração do Swagger
const swaggerDocs = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'API de Pedidos MVC', version: '1.0.0' },
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./index.js', './src/routes/*.js'], // Lê as rotas para documentação
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rota de Login para gerar o Token JWT
app.post('/login', (req, res) => {
  const token = jwt.sign({ user: 'admin' }, "sua_chave_secreta_jwt", { expiresIn: '1h' });
  res.json({ token });
});

// Acoplando as rotas de Order no caminho '/order'
app.use('/order', orderRoutes);

// Iniciando o Servidor
app.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000');
  console.log('📄 Swagger Docs: http://localhost:3000/api-docs');
});