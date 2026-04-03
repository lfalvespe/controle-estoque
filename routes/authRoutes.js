const express = require('express')
const AuthController = require('../controllers/AuthController')
const { isAuthenticated } = require('../middlewares/auth')

const router = express.Router()

router.get('/login', AuthController.getLogin)
router.post('/login', AuthController.postLogin)
router.get('/logout', AuthController.logout)
router.get('/change-password', isAuthenticated, AuthController.getChangePassword)
router.post('/change-password', isAuthenticated, AuthController.postChangePassword)

module.exports = router
