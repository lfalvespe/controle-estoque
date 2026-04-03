const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;   

