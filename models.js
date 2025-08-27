const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['Robes', 'Hauts', 'Pantalons', 'Jupes', 'Pulls', 'Manteaux', 'Combinaisons', 'T-shirts', 'Cardigans', 'Chemisiers']
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Service Schema
const serviceSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  images: [{
    type: String,
    required: true
  }],
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Category Schema
const categorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

// Models
const Product = mongoose.model('Product', productSchema);
const Service = mongoose.model('Service', serviceSchema);
const Category = mongoose.model('Category', categorySchema);

module.exports = {
  Product,
  Service,
  Category
};