const express = require('express');
const { Service } = require('./models');

const router = express.Router();

// GET - Récupérer tous les services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Récupérer un service par ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findOne({ id: parseInt(req.params.id) });
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un nouveau service
router.post('/', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Le body JSON est requis.' });
    }
    
    const { title, price, description, images } = req.body;
    if (!title || !price || !description || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Champs requis manquants ou images invalides' });
    }
    
    if (!images.every(img => typeof img === 'string')) {
      return res.status(400).json({ error: 'Chaque image doit être un lien (string)' });
    }
    
    const lastService = await Service.findOne().sort({ id: -1 });
    const newId = lastService ? lastService.id + 1 : 1;
    
    const serviceData = {
      id: newId,
      title,
      price,
      description,
      images
    };
    
    const newService = new Service(serviceData);
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT - Mettre à jour un service
router.put('/:id', async (req, res) => {
  try {
    const { title, price, description, images } = req.body;
    if (!title || !price || !description || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Champs requis manquants ou images invalides' });
    }
    
    if (!images.every(img => typeof img === 'string')) {
      return res.status(400).json({ error: 'Chaque image doit être un lien (string)' });
    }
    
    const updateData = {
      title,
      price,
      description,
      images
    };
    
    const service = await Service.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    
    res.json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Supprimer un service
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    res.json({ message: 'Service supprimé avec succès', service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;