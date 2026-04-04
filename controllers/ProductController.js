const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const PRODUCT_CATEGORIES = {
  'Perifericos': [
    'Mouse',
    'Teclado',
    'Webcam',
    'Headset',
    'Impressora',
    'Outros'
  ],
  'Computadores': [
    'Desktop',
    'Notebook',
    'Mini PC',
    'All in One'
  ],
  'Hardware': [
    'Placa-mae',
    'Processador',
    'Memoria RAM',
    'SSD',
    'HD',
    'Placa de Video',
    'Placa de Som',
    'Fonte',
    'Cooler',
    'Gabinete',
    'Outros'
  ],
  'Conectividade': [
    'Modem',
    'Roteador',
    'Switch',
    'Access Point',
    'Repetidor',
    'Placa de Rede',
    'Placa de Rede WiFi',
    'Adaptador de Rede USB',
    'Adaptador de Rede WiFi',
    'Cabos',
    'Antena',
    'Mikrotik',
    'Ubiquiti',
    'Ferramentas'
  ],
  'Energia': [
    'Estabilizador',
    'Nobreak',
    'Modulo Isolador',
    'Protetores e Filtros',
    'Auto-transformadores'
  ],
  'Informatica': [
    'Monitor',
    'Impressora',
    'Mesa Digitalizadora',
    'Scanner',
    'Leitor de Codigo de Barras'
  ]
};

const getCategoryNames = () => Object.keys(PRODUCT_CATEGORIES);

const isValidCategorySelection = (category, subcategory) => {
  if (!category || !subcategory) return false;
  const subcategories = PRODUCT_CATEGORIES[category];
  if (!subcategories) return false;
  return subcategories.includes(subcategory);
};


exports.createProduct = async (req, res) => {
  res.render('products/create', {
    categories: getCategoryNames(),
    categoryMapJson: JSON.stringify(PRODUCT_CATEGORIES)
  });
}

// Create a new product
exports.createProductPost = async (req, res) => {
  try {
    const { name, category, subcategory, description, price, available } = req.body;
    
    // Verificar se o usuário é admin
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).render('error', {
        message: 'Acesso negado. Apenas administradores podem criar produtos.'
      });
    }

    if (!isValidCategorySelection(category, subcategory)) {
      return res.status(400).render('products/create', {
        message: 'Selecione uma categoria e subcategoria validas.',
        categories: getCategoryNames(),
        categoryMapJson: JSON.stringify(PRODUCT_CATEGORIES),
        formData: { name, category, subcategory, description, price, available }
      });
    }

    const product = new Product({ 
      name, 
      category,
      subcategory,
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
    const selectedCategory = req.query.category || '';
    const selectedSubcategory = req.query.subcategory || '';
    const deleted = req.query.deleted === 'true';
    const hasFilters = Boolean(searchQuery || selectedCategory || selectedSubcategory);

    const findQuery = {};

    if (searchQuery) {
      findQuery.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    if (selectedCategory) {
      findQuery.category = selectedCategory;
    }

    if (selectedSubcategory) {
      findQuery.subcategory = selectedSubcategory;
    }

    let products = await Product.find(findQuery).lean();

    products = products.map((product) => ({
      ...product,
      imagePath: product.image || product.imageUrl
    }));

    res.render('products/all', {
      products,
      searchQuery,
      selectedCategory,
      selectedSubcategory,
      categories: getCategoryNames(),
      categoryMapJson: JSON.stringify(PRODUCT_CATEGORIES),
      hasFilters,
      deleted
    });
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
    res.render('products/edit', {
      product,
      categories: getCategoryNames(),
      categoryMapJson: JSON.stringify(PRODUCT_CATEGORIES)
    });
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

    const { name, category, subcategory, description, price, available } = req.body;
    
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let updateData = { 
      name, 
      category,
      subcategory,
      description, 
      price, 
      available: available === 'on' ? true : false
    };

    if (!isValidCategorySelection(category, subcategory)) {
      const productForView = {
        ...existingProduct.toObject(),
        ...updateData,
        imagePath: existingProduct.image || existingProduct.imageUrl
      };

      return res.status(400).render('products/edit', {
        product: productForView,
        message: 'Selecione uma categoria e subcategoria validas.',
        categories: getCategoryNames(),
        categoryMapJson: JSON.stringify(PRODUCT_CATEGORIES)
      });
    }
    
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
    