// Middleware de autenticação
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next()
    }
    res.redirect('/auth/login?redirect=' + req.originalUrl)
}

// Middleware para verificar se é admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next()
    }
    res.status(403).render('error', {
        message: 'Acesso negado. Você precisa ser administrador para acessar esta página.'
    })
}

module.exports = {
    isAuthenticated,
    isAdmin
}
