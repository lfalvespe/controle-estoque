# node-mongoose

Aplicação web fullstack desenvolvida com Node.js, Express, Handlebars e MongoDB/Mongoose. Permite o gerenciamento de produtos e usuários com autenticação por sessão.

## Tecnologias

- **Node.js** + **Express** — servidor e roteamento
- **Mongoose** — ODM para MongoDB
- **Express Handlebars** — templates server-side
- **Express Session** + **connect-mongodb-session** — autenticação com sessões persistidas no MongoDB
- **Multer** — upload de imagens de perfil e produtos
- **bcrypt** — hash de senhas
- **dotenv** — variáveis de ambiente
- **nodemon** — hot reload em desenvolvimento

## Funcionalidades

- Cadastro, listagem, edição e exclusão de produtos
- Upload de imagem por produto (arquivo)
- Listagem de produtos com busca por nome
- Autenticação (login, logout, registro)
- Perfis de usuário: `admin` e `user`
- Gerenciamento de usuários (apenas admin)
- Upload de foto de perfil
- Alteração de senha
- Tema claro/escuro persistido no `localStorage`
- Página de erro 404/500

## Estrutura

```
├── controllers/        # Lógica de negócio (Auth, Product, User)
├── db/                 # Conexão com MongoDB
├── middlewares/        # Upload (multer) e autenticação de sessão
├── models/             # Schemas Mongoose (User, Product)
├── public/             # Arquivos estáticos
│   ├── css/
│   │   ├── styles.css          # Agregador de imports
│   │   └── modules/            # Módulos CSS por domínio
│   ├── images/
│   ├── js/
│   └── uploads/        # Imagens enviadas pelos usuários (não versionado)
├── routes/             # Definição de rotas (auth, products, users)
├── views/              # Templates Handlebars
│   ├── layouts/
│   ├── partials/
│   ├── auth/
│   ├── products/
│   └── users/
└── index.js            # Entry point
```

## Pré-requisitos

- Node.js 18+
- MongoDB rodando localmente na porta `27017`

## Instalação

```bash
git clone <url-do-repositorio>
cd node-mongoose
npm install
```

## Variáveis de Ambiente

Copie o arquivo de exemplo e ajuste os valores:

```bash
cp .env.example .env
```

| Variável | Descrição | Padrão |
|---|---|---|
| `MONGODB_URI` | URI de conexão com o MongoDB (local ou Atlas) | `mongodb://localhost:27017/testemongoose` |
| `SESSION_SECRET` | Chave secreta para assinar a sessão | — |
| `PORT` | Porta em que o servidor será iniciado | `3000` |

> Nunca versione o arquivo `.env`. Ele já está incluído no `.gitignore`.

Exemplos de `MONGODB_URI`:

- Local: `mongodb://localhost:27017/testemongoose`
- Atlas: `mongodb+srv://usuario:senha@cluster.mongodb.net/?appName=Cluster0`

## Uso

```bash
npm start
```

Acesse [http://localhost:3000](http://localhost:3000).

Na primeira execução, um usuário administrador padrão é criado automaticamente:

| Campo | Valor |
|---|---|
| E-mail | admin@example.com |
| Senha | admin123 |

> Altere a senha após o primeiro acesso.
