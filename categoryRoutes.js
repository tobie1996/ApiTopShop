const express = require('express');
const { Category } = require('./models');

const router = express.Router();

// GET - Récupérer toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Récupérer une catégorie par ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ id: parseInt(req.params.id) });
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer une nouvelle catégorie
router.post('/', async (req, res) => {
  try {
    const lastCategory = await Category.findOne().sort({ id: -1 });
    const newId = lastCategory ? lastCategory.id + 1 : 1;
    
    const categoryData = { ...req.body, id: newId };
    const category = new Category(categoryData);
    await category.save();
    
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - Mettre à jour une catégorie
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Supprimer une catégorie
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!category) {
      return res.status(404).json({ error: 'Catégorie non trouvée' });
    }
    res.json({ message: 'Catégorie supprimée avec succès', category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;