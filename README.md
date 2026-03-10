# API de Gerenciamento de Pedidos (Order Management API)

Este projeto é uma API RESTful desenvolvida em Node.js para o gerenciamento de pedidos e itens. A aplicação utiliza arquitetura MVC, banco de dados relacional e inclui autenticação via JWT, além de documentação interativa com Swagger.

## 🚀 Tecnologias Utilizadas

* **Node.js** & **Express.js**: Construção do servidor e roteamento.
* **Sequelize**: ORM para mapeamento e interação com o banco de dados.
* **SQLite**: Banco de dados leve e embutido (dispensa configurações complexas de infraestrutura para testes).
* **JSON Web Token (JWT)**: Autenticação e segurança das rotas.
* **Swagger (swagger-ui-express)**: Documentação interativa da API.

## ⚙️ Pré-requisitos

Antes de começar, você precisará ter a seguinte ferramenta instalada em sua máquina:
* [Node.js](https://nodejs.org/en/) (versão 14 ou superior recomendada)

## 🛠️ Instalação e Execução

Siga os passos abaixo para rodar o projeto localmente em menos de 2 minutos:

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd <NOME_DA_PASTA_DO_PROJETO>

    Instale as dependências:
    Bash

    npm install

    Inicie o servidor:
    Bash

    node index.js

    Nota sobre o Banco de Dados: Não é necessário rodar scripts de criação de tabelas. Ao iniciar o servidor, o Sequelize sincronizará automaticamente as tabelas Order e Items criando o arquivo database.sqlite na raiz do projeto.

O servidor estará rodando na porta 3000: http://localhost:3000
🔐 Autenticação (Como Testar)

Todas as rotas de pedidos (/order) são protegidas. Para acessá-las, você precisa de um token JWT.

    Faça uma requisição POST para a rota de login:

        URL: http://localhost:3000/login

        O retorno será um objeto JSON contendo o token.

    Copie o token gerado.

    Nas requisições seguintes (ex: criar ou buscar pedido), adicione o token no cabeçalho da requisição (Headers):

        Key: Authorization

        Value: Bearer <SEU_TOKEN_AQUI>

📖 Documentação da API (Swagger)

A documentação interativa com todos os endpoints, parâmetros e exemplos de payloads pode ser acessada pelo navegador assim que o servidor estiver rodando:

👉 Acessar Swagger UI: http://localhost:3000/api-docs
📌 Principais Endpoints

    POST /login: Gera o token JWT de acesso.

    POST /order: Cria um novo pedido (trata o payload, isola o ID raiz e cadastra os itens associados).

    GET /order/list: Lista todos os pedidos cadastrados e seus respectivos itens.

    GET /order/:id: Retorna os dados completos de um pedido específico passando o ID na URL (Ex: http://localhost:3000/order/v10089016vdb).

    PUT /order/:id: Atualiza dados de um pedido existente.

    DELETE /order/:id: Remove um pedido do banco de dados.

📂 Estrutura do Projeto
Plaintext

├── src/
│   ├── config/
│   │   └── database.js       # Configuração do SQLite e Sequelize
│   ├── controllers/
│   │   └── OrderController.js# Lógica de negócio e tratamento de dados
│   ├── models/
│   │   ├── Order.js          # Modelo do Pedido
│   │   └── Item.js           # Modelo do Item
│   └── routes/
│       └── orderRoutes.js    # Definição das rotas e middleware de autenticação
├── index.js                  # Ponto de entrada da aplicação (Entry point)
├── package.json              # Dependências do projeto
└── README.md                 # Documentação do projeto

Desenvolvido por Thiago Martins para avaliação técnica - Analista de Sistemas Júnior.