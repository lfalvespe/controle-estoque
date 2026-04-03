# Sistema de Autenticação - Documentação

## 📋 Visão Geral

O sistema implementa autenticação e autorização com dois tipos de usuários:
- **Administradores**: Podem cadastrar, editar e excluir produtos, além de gerenciar usuários
- **Usuários Padrão**: Podem apenas visualizar produtos

## 🔐 Credenciais Padrão

Um usuário administrador padrão é criado automaticamente na primeira execução:

- **Email**: `admin@example.com`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere essas credenciais após o primeiro login em produção!

## 🚀 Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Logout
- ✅ Sessões persistentes no MongoDB
- ✅ Hash criptográfico de senhas com bcrypt

### Autorização
- ✅ Proteção de rotas (apenas usuários autenticados)
- ✅ Controle de permissões (apenas admins)
- ✅ Bloqueio de acesso (redirecionamento para login)

### Gerenciamento de Usuários (Admin)
- ✅ Listar todos os usuários
- ✅ Criar novo usuário
- ✅ Editar dados do usuário (nome, email, tipo)
- ✅ Deletar usuário (não permite deletar a si mesmo)

### Gerenciamento de Produtos
- ✅ Apenas admins podem criar produtos
- ✅ Apenas admins podem editar produtos
- ✅ Apenas admins podem deletar produtos
- ✅ Todos podem visualizar produtos (com/sem login)

## 📍 Rotas Principais

### Autenticação
| Rota | Método | Descrição |
|------|--------|-----------|
| `/auth/login` | GET/POST | Página de login |
| `/auth/logout` | GET | Fazer logout |

### Usuários (Admin)
| Rota | Método | Descrição |
|------|--------|-----------|
| `/users` | GET | Listar usuários |
| `/users/create` | GET/POST | Criar usuário |
| `/users/:id/edit` | GET/POST | Editar usuário |
| `/users/:id/delete` | GET | Deletar usuário |

### Produtos
| Rota | Método | Descrição | Proteção |
|------|--------|-----------|----------|
| `/products` | GET | Listar produtos | - |
| `/products/:id` | GET | Ver detalhes | - |
| `/products/create` | GET/POST | Criar produto | Admin |
| `/products/edit/:id` | GET/POST | Editar produto | Admin |
| `/products/delete/:id` | POST | Deletar produto | Admin |

## 🎯 Como Usar

### 1. Login como Admin
```
1. Clique em "Login" na navbar
2. Email: admin@example.com
3. Senha: admin123
4. Clique em "Entrar"
```

### 2. Criar Um Novo Usuário (Como Admin)
```
1. Faça login como admin
2. Clique em "Gerenciar Usuários" na navbar
3. Clique em "+ Novo Usuário"
4. Preencha os dados:
   - Nome
   - Email
   - Senha
   - Tipo (Admin ou Usuário Padrão)
5. Clique em "Criar Usuário"
```

### 3. Cadastrar Um Novo Usuário (Como Admin)
```
1. Faça login como admin
2. Clique em "Gerenciar Usuários" na navbar
3. Clique em "+ Novo Usuário"
2. Preencha os dados:
   - Nome
   - Email
   - Senha
   - Confirmar Senha
  - Tipo (Admin ou Usuário Padrão)
4. Clique em "Criar Usuário"
```

### 4. Criar Um Produto (Como Admin)
```
1. Faça login como admin
2. Clique em "Cadastrar Produto" na navbar
3. Preencha os dados do produto
4. Clique em "Cadastrar"
```

### 5. Editar Um Produto (Como Admin)
```
1. Faça login como admin
2. Vá para "Produtos"
3. Clique em um produto
4. Clique em "Editar"
5. Modifique os dados
6. Clique em "Atualizar"
```

### 6. Deletar Um Produto (Como Admin)
```
1. Faça login como admin
2. Vá para "Produtos"
3. Clique em um produto
4. Clique em "Excluir"
5. Confirme a ação
```

## 🔍 Estrutura de Arquivos

```
/models/User.js                 - Modelo Mongoose do usuário
/controllers/AuthController.js  - Lógica de login/logout
/controllers/UserController.js  - Lógica de gerenciamento de usuários
/middlewares/auth.js            - Middlewares de autenticação/autorização
/routes/authRoutes.js           - Rotas de autenticação
/routes/userRoutes.js           - Rotas de gerenciamento de usuários
/routes/productRoutes.js        - Rotas de produtos (com proteção)
/views/auth/login.hbs           - Página de login
/views/users/list.hbs           - Listar usuários
/views/users/create.hbs         - Criar usuário
/views/users/edit.hbs           - Editar usuário
/views/error.hbs                - Página de erro
```

## 🔐 Segurança

### Implementado
- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ Sessões seguras no MongoDB
- ✅ Cookie HttpOnly
- ✅ Validação de email
- ✅ Contrassenhas com requisito de confirmação
- ✅ Proteção de rotas com middleware
- ✅ Validação de permissões

### Recomendações para Produção
1. **Changear a secret da sessão** em `index.js`
2. **Usar HTTPS** (mudar `secure: true` no cookie)
3. **Implementar rate limiting** nas rotas de login
4. **Usar variáveis de ambiente** para credenciais
5. **Implementar CSRF protection**
6. **Adicionar 2FA** (autenticação em dois fatores)

## 🛠️ Configuração

### Variáveis de Ambiente (Recomendado)
Criar arquivo `.env`:
```
MONGODB_URI=mongodb://localhost:27017/testemongoose
SESSION_SECRET=sua_chave_secreta_muito_segura
NODE_ENV=development
```

### Modificar `index.js`:
```javascript
const SESSION_SECRET = process.env.SESSION_SECRET || 'sua_chave_padrao';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/testemongoose';
```

## 📖 Exemplos de Uso

### Criar um novo usuário via rota administrativa
```bash
POST /users/create
Requer sessão autenticada de administrador.
```

### Login via API (POST)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@example.com&password=admin123"
```

## ⚠️ Troubleshooting

### "Accesso negado"
- Certifique-se de estar logado como admin
- Verifique seu tipo de usuário em "Gerenciar Usuários"

### "Email já registrado"
- Use um email diferente
- Se for admin, pode editar o email do usuário existente

### "Erro ao conectar ao MongoDB"
- Verifique se o MongoDB está rodando: `sudo systemctl status mongod`
- Confirme a URI em `db/conn.js`

### "Sessão expirou"
- Faça login novamente
- A sessão expira em 24 horas por padrão

## 📝 Notas

- As senhas são criptografadas com bcrypt e nunca armazenadas em texto plano
- As sessões são armazenadas no MongoDB
- O sistema registra tentativas de acesso negado
- Quando você faz logout, a sessão é destruída no banco de dados

## 🤝 Contribuições

Para melhorias no sistema de autenticação, considere:
1. Implementar 2FA
2. Adicionar recuperação de senha por email
3. Implementar rate limiting
4. Adicionar logs de auditoria
5. Implementar OAuth (Google, GitHub)
