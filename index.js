require('dotenv').config()
const crypto = require('crypto')
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const helmet = require('helmet')
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
const connectDB = require('./db/conn')
const port = process.env.PORT || 3000
const isVercel = Boolean(process.env.VERCEL)
const productRoutes = require('./routes/productRoutes')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()
app.set('trust proxy', 1)

const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
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
        },
        resolveImageSrc: function(imageValue) {
            if (!imageValue) return ''
            if (imageValue.startsWith('http://') || imageValue.startsWith('https://') || imageValue.startsWith('data:')) {
                return imageValue
            }
            return `/uploads/${imageValue}`
        }
    }
})
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

// Configurar session store
const store = new MongoDBSession({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
})

// Configurar session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
        sameSite: 'lax'
    }
}))

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:', 'http:'],
            connectSrc: ["'self'", 'https:', 'http:'],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

const csrfSafeMethods = new Set(['GET', 'HEAD', 'OPTIONS'])

const getOrCreateCsrfToken = (req) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex')
    }
    return req.session.csrfToken
}

app.use((req, res, next) => {
    res.locals.csrfToken = getOrCreateCsrfToken(req)
    next()
})

app.use((req, res, next) => {
    if (csrfSafeMethods.has(req.method)) return next()

    const tokenFromRequest = req.query._csrf || req.body?._csrf || req.get('x-csrf-token')

    if (!tokenFromRequest || tokenFromRequest !== req.session.csrfToken) {
        return res.status(403).render('error', {
            message: 'Token CSRF invalido. Recarregue a pagina e tente novamente.'
        })
    }

    next()
})

let dbReady = false
let bootstrapPromise = null
const ensureDbConnection = async () => {
    if (dbReady) return

    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            await connectDB()
            await createDefaultAdmin()
            dbReady = true
        })()
    }

    await bootstrapPromise
}

app.use(async (req, res, next) => {
    try {
        await ensureDbConnection()
        next()
    } catch (error) {
        console.error('Erro de conexao com MongoDB:', error.message)
        res.status(500).render('error', {
            message: 'Erro de conexao com banco de dados. Verifique MONGODB_URI e acesso no MongoDB Atlas.'
        })
    }
})

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

if (!isVercel) {
    app.listen(port, () => {
        console.log('Server is running on port: ' + port)
        ensureDbConnection().catch((error) => {
            console.error('Falha no bootstrap inicial:', error.message)
        })
    })
}

module.exports = app
