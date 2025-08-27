const express = require('express');
const { Product } = require('./models');

const router = express.Router();

// GET - Récupérer tous les produits
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id) });
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un nouveau produit
router.post('/', async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;
    
    // Vérifier la présence des champs requis
    const { category, title, price, description, images } = req.body;
    if (!category || !title || !price || !description || !images || images.length === 0) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    
    const productData = {
      id: newId,
      images,
      category,
      title,
      price,
      description
    };
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).send(JSON.stringify({ error, message: error.message, stack: error.stack }, null, 2));
  }
});

// PUT - Mettre à jour un produit
router.put('/:id', async (req, res) => {
  try {
    const { category, title, price, description, images } = req.body;
    if (!category || !title || !price || !description) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    
    const updateData = {
      category,
      title,
      price,
      description
    };
    
    if (images && images.length > 0) {
      updateData.images = images;
    }
    
    const product = await Product.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).send(JSON.stringify({ error, message: error.message, stack: error.stack }, null, 2));
  }
});

// DELETE - Supprimer un produit
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json({ message: 'Produit supprimé avec succès', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Initialiser la base avec des données d'exemple
router.post('/init-data', async (req, res) => {
  try {
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      return res.json({ message: 'La base de données contient déjà des produits' });
    }

    const sampleProducts = [
      {
        id: 1,
        images: [
          "https://m.media-amazon.com/images/I/711jn73Rq3L._AC_SX569_.jpg",
          "https://m.media-amazon.com/images/I/81FBJmpHFyL._AC_SY741_.jpg",
          "https://m.media-amazon.com/images/I/817AEoX9dML._AC_SY741_.jpg",
          "https://m.media-amazon.com/images/I/81D5kR7pYDL._AC_SX569_.jpg"
        ],
        category: "Robes",
        title: "Robe",
        price: 79.99,
        description: "Découvrez la Robe d'Été Fleurie, parfaite pour les journées ensoleillées. Confort et élégance assurés dans la catégorie Robes."
      }
    ];

    await Product.insertMany(sampleProducts);
    res.json({ message: 'Données d\'exemple ajoutées avec succès', count: sampleProducts.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;