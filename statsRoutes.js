const express = require('express');
const { Product } = require('./models');

const router = express.Router();

// GET - Récupérer les statistiques
router.get('/', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    
    const avgPriceResult = await Product.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);
    const averagePrice = avgPriceResult[0]?.avgPrice || 0;

    const productsByCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoryStats = {};
    productsByCategory.forEach(item => {
      categoryStats[item._id] = item.count;
    });

    res.json({
      totalProducts,
      averagePrice: Math.round(averagePrice * 100) / 100,
      productsByCategory: categoryStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;