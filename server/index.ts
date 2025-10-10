import express from 'express';
import path from 'path';
import routes from './routes.js';
import './utils/questionLoader.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(routes);

// Serve static files from Vite build (for production)
// Use process.cwd() for more reliable path resolution in production
const distPath = path.join(process.cwd(), 'dist');
console.log('Serving static files from:', distPath);
app.use(express.static(distPath));

// Handle client-side routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
