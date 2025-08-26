const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/TopShopDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connecté à MongoDB');
});

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

// Middleware d'authentification HTTP Basic
const basicAuth = (req, res, next) => {
  // Autoriser l'accès à la documentation Swagger sans authentification
  if (req.path.startsWith('/api-docs') || req.path === '/') return next();
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="API"');
    return res.status(401).json({ error: 'Authentification requise' });
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  if (username === 'admin' && password === 'admin123') {
    return next();
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="API"');
  return res.status(401).json({ error: 'Identifiants invalides' });
};

app.use(basicAuth);

// Swagger Configuration
const swaggerOptions = {
  definition: yaml.load('./swagger.yaml'),
  apis: [],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Service CRUD
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services/:id', async (req, res) => {
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

app.post('/api/services', async (req, res) => {
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

app.put('/api/services/:id', async (req, res) => {
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

app.delete('/api/services/:id', async (req, res) => {
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

// CRUD for Category
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories/:id', async (req, res) => {
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

app.post('/api/categories', async (req, res) => {
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

app.put('/api/categories/:id', async (req, res) => {
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

app.delete('/api/categories/:id', async (req, res) => {
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

// Product CRUD
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
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

app.post('/api/products', async (req, res) => {
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

app.put('/api/products/:id', async (req, res) => {
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

app.delete('/api/products/:id', async (req, res) => {
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

app.get('/api/categories-list', (req, res) => {
  const categories = ['Robes', 'Hauts', 'Pantalons', 'Jupes', 'Pulls', 'Manteaux', 'Combinaisons', 'T-shirts', 'Cardigans', 'Chemisiers'];
  res.json(categories);
});

app.get('/api/stats', async (req, res) => {
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

// Route pour initialiser la base de données avec les données d'exemple
app.post('/api/init-data', async (req, res) => {
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

// Route pour afficher tous les endpoints
app.get('/api/endpoints', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Route simple
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router (ex: express.Router)
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ endpoints: routes });
});

app.get('/', (req, res) => {
  res.json({
    message: 'API Fashion Dashboard',
    documentation: `http://localhost:${PORT}/api-docs`,
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      services: '/api/services',
      stats: '/api/stats',
      all: '/api/endpoints'
    }
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Documentation Swagger disponible sur: http://localhost:${PORT}/api-docs`);
});

module.exports = app;