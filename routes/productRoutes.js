const router = require('express').Router()

const ProductController = require('../controllers/ProductController')
const { isAuthenticated, isAdmin } = require('../middlewares/auth')
const upload = require('../middlewares/upload')

router.get('/create', isAuthenticated, isAdmin, ProductController.createProduct)
router.post('/create', isAuthenticated, isAdmin, upload.single('image'), ProductController.createProductPost)
router.get('/', ProductController.getProducts)
router.get('/:id', ProductController.getProductById)
router.get('/edit/:id', isAuthenticated, isAdmin, ProductController.updateProduct)
router.post('/edit/:id', isAuthenticated, isAdmin, upload.single('image'), ProductController.updateProductPost)
router.post('/delete/:id', isAuthenticated, isAdmin, ProductController.deleteProduct)                 

module.exports = router