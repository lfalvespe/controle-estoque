const express = require('express')
const rateLimit = require('express-rate-limit')
const AuthController = require('../controllers/AuthController')
const { isAuthenticated } = require('../middlewares/auth')

const router = express.Router()

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Muitas tentativas de login. Tente novamente em alguns minutos.'
})

router.get('/login', AuthController.getLogin)
router.post('/login', loginLimiter, AuthController.postLogin)
router.get('/logout', AuthController.logout)
router.get('/change-password', isAuthenticated, AuthController.getChangePassword)
router.post('/change-password', isAuthenticated, AuthController.postChangePassword)

module.exports = router
