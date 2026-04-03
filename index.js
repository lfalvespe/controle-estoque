const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
const conn = require('./db/conn')
const port = 3000
const productRoutes = require('./routes/productRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()
const hbs = exphbs.create({
    extname: 'hbs',
    helpers: {
        isAdmin: function(role) {
            return role === 'admin';
        },
        formatCurrency: function(value) {
            const numberValue = Number(value)
            if (Number.isNaN(numberValue)) return 'R$ 0,00'

            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(numberValue)
        },
        formatDate: function(date) {
            if (!date) return ''
            const d = new Date(date);
            return d.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            });
        },
        eq: function(a, b) {
            return a === b;
        }
    }
})
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')

// Configurar session store
const store = new MongoDBSession({
    uri: 'mongodb://localhost:27017/testemongoose',
    collection: 'sessions'
})

// Configurar session
app.use(session({
    secret: 'sua_chave_secreta_aqui',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 horas
    }
}))

// Middleware CSP permissivo para desenvolvimento
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' https: http:; connect-src *")
    next()
})

app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// Middleware para passar usuário para o Handlebars
app.use((req, res, next) => {
    res.locals.user = req.session.user || null
    next()
})

app.use('/products', productRoutes)
app.use('/auth', authRoutes)
app.use('/users', userRoutes)

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/about', (req, res) => {
    res.render('about')
})
app.get('/contact', (req, res) => {             
    res.render('contact')
})

// Criar admin padrão se não houver usuários
const User = require('./models/User')

async function createDefaultAdmin() {
    try {
        const adminExists = await User.findOne({ role: 'admin' })
        
        if (!adminExists) {
            const defaultAdmin = await User.create({
                name: 'Administrador',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            })
            console.log('✅ Admin padrão criado: admin@example.com / admin123')
        }
    } catch (error) {
        console.error('Erro ao criar admin padrão:', error.message)
    }
}

// 404 - rota não encontrada
app.use((req, res) => {
    res.status(404).render('error', { message: 'Página não encontrada.' })
})

// 500 - erro interno
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).render('error', { message: 'Ocorreu um erro interno no servidor.' })
})

app.listen(port, () => {
    console.log('Server is running on port: ' + port)
    createDefaultAdmin()
})
