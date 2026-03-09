// ==========================================
// 0. IMPORTAÇÕES E CONFIGURAÇÕES INICIAIS
// ==========================================
// Importa os módulos necessários. Express para o servidor web, Sequelize para ORM com BD SQLite,
// JWT para autenticação, e Swagger para documentação da API.
// Nota: Todas as dependências devem ser instaladas via 'npm install'.
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Cria a instância do app Express e configura para parsear JSON no body das requisições.
const app = express();
app.use(express.json());

// Chave secreta para JWT. Em produção, use uma chave forte e armazene em variáveis de ambiente (ex.: process.env.SECRET_KEY).
const SECRET_KEY = "sua_chave_secreta_jwt";

// ==========================================
// 1. CONFIGURAÇÃO DO SWAGGER (DOCUMENTAÇÃO DA API)
// ==========================================
// Configura as opções do Swagger. Define a spec OpenAPI 3.0 com título, descrição e esquema de segurança JWT.
// O 'apis' aponta para este arquivo para extrair docs dos comentários @swagger.
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Pedidos (Jitterbit Challenge)',
      version: '1.0.0',
      description: 'API para gerenciamento de pedidos com transformação de payload e autenticação JWT.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./apptest.js'], // Ajustado para o nome do arquivo atual. Mude se o arquivo tiver outro nome.
};

// Gera os docs e configura a rota /api-docs para exibir a UI interativa do Swagger.
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ==========================================
// 2. CONFIGURAÇÃO DO BANCO DE DADOS (SQLite + Sequelize)
// ==========================================
// Cria a conexão com SQLite. Usa armazenamento em arquivo local './database.sqlite'.
// Desativa logging para evitar clutter no console, mas pode ativar para depuração.
const sequelize = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite', logging: false });

// Define o modelo 'Order' (Pedido). Corresponde à tabela Order no teste: orderId (PK), value, creationDate.
// Desativa timestamps automáticos para não adicionar colunas extras.
const Order = sequelize.define('Order', {
  orderId: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.FLOAT },
  creationDate: { type: DataTypes.DATE }
}, { timestamps: false });

// Define o modelo 'Item'. Corresponde à tabela Items: id (PK auto-incremento), orderId (FK), productId, quantity, price.
const Item = sequelize.define('Item', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.STRING, references: { model: Order, key: 'orderId' } },
  productId: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER },
  price: { type: DataTypes.FLOAT }
}, { timestamps: false });

// Configura relacionamentos: Um Pedido tem Muitos Itens (1:N). Usa cascade para delete automático de itens ao deletar pedido.
Order.hasMany(Item, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
Item.belongsTo(Order, { foreignKey: 'orderId' });

// Sincroniza os modelos com o BD (cria tabelas se não existirem). Em produção, use migrations para controle de versão.
sequelize.sync().then(() => {
  console.log('Banco de dados sincronizado com sucesso.');
}).catch(err => {
  console.error('Erro ao sincronizar BD:', err.message);
});

// ==========================================
// 3. MIDDLEWARE DE AUTENTICAÇÃO (JWT)
// ==========================================
// Middleware para verificar token JWT no header 'Authorization'.
// Extrai o token, verifica validade e prossegue se ok. Retorna 401/403 em caso de erro.
// Obrigatório para endpoints protegidos, conforme opcional do teste.
function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });
  jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido.' });
    next();
  });
}

// ==========================================
// 4. ENDPOINTS (ROTAS DA API)
// ==========================================

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Gera um token JWT para testes
 *     responses:
 *       200:
 *         description: Retorna o token
 */
app.post('/login', (req, res) => {
  // Gera um token JWT simples para o usuário 'admin', expirando em 1 hora.
  const token = jwt.sign({ user: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Cria um novo pedido (com mapeamento de dados)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               numeroPedido: "v10089015vdb-01"
 *               valorTotal: 10000
 *               dataCriacao: "2023-07-19T12:24:11.529Z"
 *               items: [{ idItem: "2434", quantidadeItem: 1, valorItem: 1000 }]
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Payload inválido
 *       500:
 *         description: Erro ao processar
 */
app.post('/order', verificarToken, async (req, res) => {
  try {
    const payload = req.body;
    // Validação básica: Verifica se campos obrigatórios existem para evitar erros no mapeamento.
    if (!payload.numeroPedido || !payload.valorTotal || !payload.dataCriacao || !Array.isArray(payload.items)) {
      return res.status(400).json({ error: 'Payload inválido: campos obrigatórios ausentes.' });
    }

    // Mapeamento de dados conforme requisito do teste: Remove '-01' do numeroPedido, renomeia campos.
    // Converte items para o formato esperado (productId, quantity, price).
    const mappedOrderId = payload.numeroPedido.replace('-01', '');
    const transformedData = {
      orderId: mappedOrderId,
      value: payload.valorTotal,
      creationDate: payload.dataCriacao,
      items: payload.items.map(item => ({
        productId: item.idItem,
        quantity: item.quantidadeItem,
        price: item.valorItem
      }))
    };

    // Cria o pedido e itens associados em uma transação única usando include.
    const novoPedido = await Order.create(transformedData, {
      include: [{ model: Item, as: 'items' }]
    });

    // Retorna o JSON transformado com status 201 (Created), conforme convenção HTTP.
    res.status(201).json(transformedData);
  } catch (error) {
    // Tratamento de erros robusto: Loga o erro e retorna mensagem compreensível com details.
    console.error('Erro ao criar pedido:', error.message);
    res.status(500).json({ error: 'Erro ao processar o pedido', details: error.message });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   get:
 *     summary: Obtém os dados de um pedido pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do pedido
 *       404:
 *         description: Pedido não encontrado
 */
app.get('/order/:orderId', verificarToken, async (req, res) => {
  try {
    // Busca o pedido pelo orderId, incluindo itens associados.
    const pedido = await Order.findByPk(req.params.orderId, { include: ['items'] });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(pedido);
  } catch (error) {
    console.error('Erro ao obter pedido:', error.message);
    res.status(500).json({ error: 'Erro ao obter pedido', details: error.message });
  }
});

/**
 * @swagger
 * /order/list:
 *   get:
 *     summary: Lista todos os pedidos (opcional)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
app.get('/order/list', verificarToken, async (req, res) => {
  try {
    // Busca todos os pedidos, incluindo itens. Retorna array vazio se nenhum.
    const pedidos = await Order.findAll({ include: ['items'] });
    res.json(pedidos);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error.message);
    res.status(500).json({ error: 'Erro ao listar pedidos', details: error.message });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   put:
 *     summary: Atualiza um pedido existente (opcional)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               valorTotal: 15000
 *               items: [{ idItem: "2434", quantidadeItem: 2, valorItem: 1500 }]
 *     responses:
 *       200:
 *         description: Pedido atualizado
 *       404:
 *         description: Pedido não encontrado
 *       400:
 *         description: Payload inválido
 */
app.put('/order/:orderId', verificarToken, async (req, res) => {
  try {
    const payload = req.body;
    const orderId = req.params.orderId;

    // Busca o pedido existente.
    const pedido = await Order.findByPk(orderId);
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

    // Atualização parcial: Apenas atualiza campos enviados. Se numeroPedido novo, mapeia removendo '-01'.
    if (payload.numeroPedido) {
      pedido.orderId = payload.numeroPedido.replace('-01', '');
    }
    if (payload.valorTotal) pedido.value = payload.valorTotal;
    if (payload.dataCriacao) pedido.creationDate = payload.dataCriacao;

    await pedido.save();

    // Se items forem enviados, deleta os antigos e cria novos (simples, sem otimização para diff).
    if (Array.isArray(payload.items)) {
      await Item.destroy({ where: { orderId } });
      const newItems = payload.items.map(item => ({
        orderId: pedido.orderId,
        productId: item.idItem,
        quantity: item.quantidadeItem,
        price: item.valorItem
      }));
      await Item.bulkCreate(newItems);
    }

    // Retorna o pedido atualizado com itens.
    const updatedPedido = await Order.findByPk(pedido.orderId, { include: ['items'] });
    res.json(updatedPedido);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar pedido', details: error.message });
  }
});

/**
 * @swagger
 * /order/{orderId}:
 *   delete:
 *     summary: Deleta um pedido (opcional)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Pedido deletado
 *       404:
 *         description: Pedido não encontrado
 */
app.delete('/order/:orderId', verificarToken, async (req, res) => {
  try {
    // Busca e deleta o pedido. Itens são deletados via cascade.
    const rowsDeleted = await Order.destroy({ where: { orderId: req.params.orderId } });
    if (rowsDeleted === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.status(204).send(); // No Content, conforme convenção para DELETE bem-sucedido.
  } catch (error) {
    console.error('Erro ao deletar pedido:', error.message);
    res.status(500).json({ error: 'Erro ao deletar pedido', details: error.message });
  }
});

// ==========================================
// 5. INICIALIZAÇÃO DO SERVIDOR
// ==========================================
// Inicia o servidor na porta 3000. Loga mensagens de sucesso, incluindo link para Swagger.
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
  console.log('📄 Swagger Docs: http://localhost:3000/api-docs');
});