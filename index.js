const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jwt = require('jsonwebtoken');

// 
const sequelize = require('./src/config/database');
const Order = require('./src/models/Order');
const Item = require('./src/models/Item');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();
app.use(express.json());

// bd
Order.hasMany(Item, { foreignKey: 'orderId', as: 'items' });
Item.belongsTo(Order, { foreignKey: 'orderId' });


sequelize.sync().then(() => console.log("✅ Banco de dados SQLite sincronizado!"));

// sggr
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Pedidos MVC',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }],
    // Mapeando as rotas diretamente aqui, sem erro de digitação!
   paths: {
      "/login": {
        post: {
          summary: "Gera o Token JWT de Autenticação",
          tags: ["Auth"],
          responses: { "200": { description: "Token gerado com sucesso" } }
        }
      },
      "/order": {
        post: {
          summary: "Cria um novo pedido",
          tags: ["Orders"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  example: {
                    "numeroPedido": "v10089015vdb-01",
                    "valorTotal": 10000,
                    "dataCriacao": "2023-07-19T12:24:11.529Z",
                    "items": [{ "idItem": "2434", "quantidadeItem": 1, "valorItem": 1000 }]
                  }
                }
              }
            }
          },
          responses: { "201": { description: "Pedido Criado" } }
        }
      },
      "/order/list": {
        get: {
          summary: "Lista todos os pedidos",
          tags: ["Orders"],
          responses: { "200": { description: "Sucesso" } }
        }
      },
      "/order/{id}": {
        get: {
          summary: "Busca um pedido pelo ID",
          tags: ["Orders"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Sucesso" } }
        },
        put: {
          summary: "Atualiza um pedido",
          tags: ["Orders"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  example: { "value": 500.0, "creationDate": "2024-01-01" }
                }
              }
            }
          },
          responses: { "200": { description: "Atualizado com sucesso" } }
        },
        delete: {
          summary: "Remove um pedido",
          tags: ["Orders"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Removido com sucesso" } }
        }
      }
    }
  },
  apis: [] // Deixamos vazio de propósito para ele não tentar ler arquivos e dar erro
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 
app.post('/login', (req, res) => {
  const token = jwt.sign({ user: 'admin' }, "sua_chave_secreta_aqui", { expiresIn: '1h' });
  res.json({ token });
});

// 
app.use('/order', orderRoutes);

// 
app.listen(3000, () => {
  console.log('🚀 Servidor rodando na porta 3000');
  console.log('📄 Swagger Docs: http://localhost:3000/api-docs');
});