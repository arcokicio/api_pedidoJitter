const Order = require('../models/Order');
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
};