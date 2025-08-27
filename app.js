const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');

const connectDB = require('./database');
const basicAuth = require('./middleware');
const productRoutes = require('./productRoutes');
const serviceRoutes = require('./serviceRoutes');
const categoryRoutes = require('./categoryRoutes');
const statsRoutes = require('./statsRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à la base de données
connectDB();

// Middleware d'authentification
app.use(basicAuth);

// Swagger Configuration
const swaggerOptions = {
  definition: yaml.load('./swagger.yaml'),
  apis: [],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);

// Route pour lister les catégories disponibles
app.get('/api/categories-list', (req, res) => {
  const categories = ['Robes', 'Hauts', 'Pantalons', 'Jupes', 'Pulls', 'Manteaux', 'Combinaisons', 'T-shirts', 'Cardigans', 'Chemisiers'];
  res.json(categories);
});

// Route pour afficher tous les endpoints
app.get('/api/endpoints', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
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

// Route d'accueil
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