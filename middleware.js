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

module.exports = basicAuth;