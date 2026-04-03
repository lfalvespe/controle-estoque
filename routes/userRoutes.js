const express = require('express')
const UserController = require('../controllers/UserController')
const upload = require('../middleware/upload')
const { isAuthenticated, isAdmin } = require('../middlewares/auth')

const router = express.Router()

router.get('/profile', isAuthenticated, UserController.getProfile)
router.get('/profile/edit', isAuthenticated, UserController.getEditOwnProfile)
router.post('/profile/edit', isAuthenticated, upload.single('profileImage'), UserController.postEditOwnProfile)
router.get('/', isAuthenticated, isAdmin, UserController.getUsers)
router.get('/create', isAuthenticated, isAdmin, UserController.getCreateUser)
router.post('/create', isAuthenticated, isAdmin, upload.single('profileImage'), UserController.postCreateUser)
router.get('/:id/change-password', isAuthenticated, isAdmin, UserController.getAdminChangeUserPassword)
router.post('/:id/change-password', isAuthenticated, isAdmin, UserController.postAdminChangeUserPassword)
router.get('/:id/edit', isAuthenticated, isAdmin, UserController.getEditUser)
router.post('/:id/edit', isAuthenticated, isAdmin, upload.single('profileImage'), UserController.postEditUser)
router.get('/:id/delete', isAuthenticated, isAdmin, UserController.deleteUser)

module.exports = router
