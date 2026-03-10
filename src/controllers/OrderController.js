const Order = require('../models/Order');
const Item = require('../models/Item');

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
        try {

            const payload = await getData(req.body);


            if (!payload.numeroPedido) {
                throw new Error("O campo 'numeroPedido' é obrigatório.");
            }


            let partesPedido = payload.numeroPedido.split('-');
            partesPedido.pop();
            const mappedOrderId = partesPedido.join('-');


            const mappedItems = payload.items
                .filter(item => item.quantidadeItem > 0) 
                .map(item => ({
                    productId: item.idItem,
                    quantity: item.quantidadeItem,
                    price: item.valorItem
                }));


            const transformedData = {
                orderId: mappedOrderId,
                value: payload.valorTotal,
                creationDate: payload.dataCriacao,
                items: mappedItems
            };


            const novoPedido = await Order.create(transformedData, { include: [{ model: Item, as: 'items' }] });

            res.status(201).json(novoPedido);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },


    async listarPedidos(req, res) {
        try {
            const pedidos = await Order.findAll({ include: [{ model: Item, as: 'items' }] });
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },


    async buscarPedido(req, res) {
        try {
            const pedido = await Order.findByPk(req.params.id, { include: [{ model: Item, as: 'items' }] });
            if (!pedido) throw new Error("Pedido não encontrado");
            res.json(pedido);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },


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

