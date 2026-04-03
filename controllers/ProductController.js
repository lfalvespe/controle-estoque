const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');


exports.createProduct = async (req, res) => {
  res.render('products/create');
}

// Create a new product
exports.createProductPost = async (req, res) => {
  try {
    const { name, description, price, available } = req.body;
    
    // Verificar se o usuário é admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).render('error', {
        message: 'Acesso negado. Apenas administradores podem criar produtos.'
      });
    }

    const product = new Product({ 
      name, 
      image: req.file ? req.file.filename : undefined,
      description, 
      price, 
      available: available === 'on' ? true : false
    });                                                             
    await product.save();     
    res.status(201).redirect(`/products/${product._id}?created=true`);
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const deleted = req.query.deleted === 'true';
    let products;

    if (searchQuery) {
      products = await Product.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ]
      }).lean();
    } else {
      products = await Product.find().lean();
    }

    products = products.map((product) => ({
      ...product,
      imagePath: product.image || product.imageUrl
    }));

    res.render('products/all', { products, searchQuery, deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const updated = req.query.updated === 'true';
    const created = req.query.created === 'true';
    product.imagePath = product.image || product.imageUrl;
    res.render('products/product', { product, updated, created });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Update a product by ID (render edit form)
exports.updateProduct = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).render('error', {
        message: 'Acesso negado. Apenas administradores podem editar produtos.'
      });
    }

    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    product.imagePath = product.image || product.imageUrl;
    res.render('products/edit', { product });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product for editing' });
  }
};

// Update a product by ID
exports.updateProductPost = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).render('error', {
        message: 'Acesso negado. Apenas administradores podem editar produtos.'
      });
    }

    const { name, description, price, available } = req.body;
    
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let updateData = { 
      name, 
      description, 
      price, 
      available: available === 'on' ? true : false
    };
    
    if (req.file) {
      updateData.image = req.file.filename;

      if (existingProduct.image) {
        const previousImagePath = path.join(__dirname, '../public/uploads', existingProduct.image);
        if (fs.existsSync(previousImagePath)) {
          fs.unlinkSync(previousImagePath);
        }
      }
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.redirect(`/products/${updatedProduct._id}?updated=true`);
  } catch (error) {
    console.error('Update error:', error.message);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).render('error', {
        message: 'Acesso negado. Apenas administradores podem deletar produtos.'
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).redirect('/products');
    }

    if (product.image) {
      const imagePath = path.join(__dirname, '../public/uploads', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.redirect('/products?deleted=true');
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
    