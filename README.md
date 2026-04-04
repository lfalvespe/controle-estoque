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
- Listagem de produtos com busca por nome e descrição
- Filtros por categoria e subcategoria
- Visualização de produtos em modo grade e lista (com preferência salva no `localStorage`)
- Autenticação (login, logout e alteração de senha)
- Perfis de usuário: `admin` e `user`
- Gerenciamento de usuários (apenas admin)
- Upload de foto de perfil
- Alteração de senha
- Confirmações de exclusão via modal
- Tema claro/escuro persistido no `localStorage`
- Página de erro 404/500

## Screenshot

<p align="center">
  <img src="public/images/screenshot.png" alt="Tela de produtos no modo lista" width="450" />
</p>

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

## Scripts

| Script | Comando | Descrição |
|---|---|---|
| `npm start` | `nodemon ./index.js 0.0.0.0 3000` | Inicia a aplicação em modo desenvolvimento com recarga automática |

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

## Deploy (Vercel)

### Pré-requisitos

- Conta no [Vercel](https://vercel.com/)
- MongoDB Atlas configurado (com conexão remota ativada)
- Repositório no GitHub, GitLab ou Bitbucket

### Passos

1. **Conecte seu repositório ao Vercel**
   - Entre em [vercel.com/dashboard](https://vercel.com/dashboard)
   - Clique em "Add New" → "Project"
   - Selecione seu repositório

2. **Configure as variáveis de ambiente**
   - Na página do projeto, acesse "Settings" → "Environment Variables"
   - Adicione as variáveis:
     - `MONGODB_URI`: sua connection string do MongoDB Atlas
     - `SESSION_SECRET`: uma chave segura (ex: resultado de `openssl rand -hex 32`)
     - `NODE_ENV`: `production` (opcional, já definido em vercel.json)

3. **Deploy**
   - O Vercel fará deploy automaticamente no push para a branch principal
   - Ou clique em "Deploy Now" para deploy manual

### ⚠️ Notas Importantes

- **Uploads de arquivos**: Os arquivos enviados (imagens de perfil e produtos) são armazenados em `public/uploads/`. Em Vercel, isso é efêmero e será perdido após redeploy. Para produção, considere usar:
  - AWS S3
  - Google Cloud Storage
  - Cloudinary
  - ou outro serviço de armazenamento em nuvem

- **Primeira execução**: A criação do admin padrão ocorrerá na primeira execução. Não será possível em Vercel após redeploy (use um serviço de storage ou banco de dados para persistência).

- **Comandos locais**:
  - `npm start` — Production (sem reload automático)
  - `npm run dev` — Desenvolvimento (com nodemon)
