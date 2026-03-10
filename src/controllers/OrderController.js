const Order = require('../models/Order');
const Item = require('../models/Item');

// 1. OBRIGAÇÃO: async function getData() => new Promise({});
// Criamos uma função simulada que resolve os dados ou rejeita se estiver vazio
const getData = async (data) => {
    return new Promise((resolve, reject) => {
        if (!data || Object.keys(data).length === 0) {
            reject(new Error("O corpo da requisição não pode estar vazio."));
        }
        resolve(data);
    });
};

module.exports = {
    // CREATE (POST)
    async criarPedido(req, res) {
        // 2. OBRIGAÇÃO: try catch
        try {
            // 3. OBRIGAÇÃO: async await getData
            const payload = await getData(req.body);

            // 4. OBRIGAÇÃO: throw para criar e lançar exceções
            if (!payload.numeroPedido) {
                throw new Error("O campo 'numeroPedido' é obrigatório.");
            }

            // 5. OBRIGAÇÃO: array.pop
            // Mapping: Pegando "v10089015vdb-01", separando por "-" e removendo o "01" com pop()
            let partesPedido = payload.numeroPedido.split('-'); 
            partesPedido.pop(); // Remove e descarta o último item da array ("01")
            const mappedOrderId = partesPedido.join('-'); // Remonta a string ("v10089015vdb")

            // 6. OBRIGAÇÕES: array.filter e array.map
            // Filtra itens com quantidade 0 (para evitar lixo) e mapeia para o formato do Banco
            const mappedItems = payload.items
                .filter(item => item.quantidadeItem > 0) // Passa apenas itens válidos
                .map(item => ({
                    productId: item.idItem,
                    quantity: item.quantidadeItem,
                    price: item.valorItem
                }));

            // Montagem final do JSON transformado
            const transformedData = {
                orderId: mappedOrderId,
                value: payload.valorTotal,
                creationDate: payload.dataCriacao,
                items: mappedItems
            };

            // Salva no banco de dados (Tabela Order + Tabela Items em cascata)
            const novoPedido = await Order.create(transformedData, { include: [{ model: Item, as: 'items' }] });
            
            res.status(201).json(novoPedido);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // READ ALL (GET /order/list)
    async listarPedidos(req, res) {
        try {
            const pedidos = await Order.findAll({ include: [{ model: Item, as: 'items' }] });
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // READ ONE (GET /order/:id)
    async buscarPedido(req, res) {
        try {
            const pedido = await Order.findByPk(req.params.id, { include: [{ model: Item, as: 'items' }] });
            if (!pedido) throw new Error("Pedido não encontrado"); // Mais um uso do throw
            res.json(pedido);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    // UPDATE (PUT /order/:id)
    async atualizarPedido(req, res) {
        try {
            const pedido = await Order.findByPk(req.params.id);
            if (!pedido) throw new Error("Pedido não encontrado");
            
            await pedido.update({ value: req.body.value, creationDate: req.body.creationDate });
            res.json({ message: "Pedido atualizado", pedido });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    // DELETE (DELETE /order/:id)
    async deletarPedido(req, res) {
        try {
            const deletado = await Order.destroy({ where: { orderId: req.params.id } });
            if (!deletado) throw new Error("Pedido não encontrado");
            res.json({ message: "Pedido removido com sucesso" });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
};



/* const Order = require('../models/Order');
const Item = require('../models/Item');

// A sua função matemática otimizada
function calcularSomaPares(n) {
    let k = Math.floor(Number(n) / 2);
    return (BigInt(k) * BigInt(k + 1)).toString();
}

module.exports = {
    // CREATE (POST)
    async criarPedido(req, res) {
        try {
            const payload = req.body;
            // Mapping dos dados (ex: "v10089015vdb-01" vira "v10089015vdb")
            const mappedOrderId = payload.numeroPedido.replace('-01', '');
            
            const transformedData = {
                orderId: mappedOrderId,
                value: payload.valorTotal,
                creationDate: payload.dataCriacao,
                resultSoma: calcularSomaPares(payload.valorTotal),
                items: payload.items.map(item => ({
                    productId: item.idItem,
                    quantity: item.quantidadeItem,
                    price: item.valorItem
                }))
            };

            const novoPedido = await Order.create(transformedData, { include: ['items'] });
            res.status(201).json(novoPedido);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar pedido', details: error.message });
        }
    },

    // READ ALL (GET)
    async listarPedidos(req, res) {
        const pedidos = await Order.findAll({ include: ['items'] });
        res.json(pedidos);
    },

    // READ ONE (GET)
    async buscarPedido(req, res) {
        const pedido = await Order.findByPk(req.params.id, { include: ['items'] });
        if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });
        res.json(pedido);
    },

    // UPDATE (PUT)
    async atualizarPedido(req, res) {
        const pedido = await Order.findByPk(req.params.id);
        if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });
        
        await pedido.update({ 
            value: req.body.valorTotal, 
            resultSoma: calcularSomaPares(req.body.valorTotal) 
        });
        res.json({ message: "Pedido atualizado com sucesso", pedido });
    },

    // DELETE (DELETE)
    async deletarPedido(req, res) {
        const deletado = await Order.destroy({ where: { orderId: req.params.id } });
        if (!deletado) return res.status(404).json({ error: "Pedido não encontrado" });
        res.json({ message: "Pedido removido com sucesso" });
    }
};*/