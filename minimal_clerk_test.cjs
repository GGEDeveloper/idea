require('dotenv').config();
const express = require('express');
const { clerkMiddleware, requireAuth } = require('@clerk/express');

console.log('[Minimal Test] CLERK_SECRET_KEY from process.env:', process.env.CLERK_SECRET_KEY ? `Loaded - starts with: ${process.env.CLERK_SECRET_KEY.substring(0,10)}` : 'NOT LOADED or Empty');
console.log('[Minimal Test] CLERK_PUBLISHABLE_KEY from process.env:', process.env.CLERK_PUBLISHABLE_KEY ? `Loaded - starts with: ${process.env.CLERK_PUBLISHABLE_KEY.substring(0,10)}` : 'NOT LOADED or Empty');

const app = express();
const PORT = 3001; // Usar uma porta diferente da sua aplicação principal

// Passar as chaves diretamente como opções pode ajudar a isolar problemas de carregamento do .env
// Certifique-se que estas variáveis estão corretas no seu .env!
app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  debug: true
}));

app.get('/api/protected', requireAuth({ debug: true }), (req, res) => {
  console.log('[Minimal Test /api/protected] Route handler reached!');
  const auth = req.auth();
  if (auth && auth.userId) {
    console.log('[Minimal Test /api/protected] Auth object:', JSON.stringify(auth, null, 2));
    res.json({ message: 'Reached protected route!', userId: auth.userId, authData: auth });
  } else {
    console.log('[Minimal Test /api/protected] Auth object or userId NOT FOUND on req.auth(). Auth object value:', JSON.stringify(auth, null, 2));
    res.status(403).json({ message: 'Auth object or userId not found', authData: auth });
  }
});

// Rota pública para verificar se o servidor está a responder
app.get('/api/public', (req, res) => {
  console.log('[Minimal Test /api/public] Public route hit');
  res.json({ message: 'Public route is working!' });
});

app.use((err, req, res, next) => {
  console.error('[Minimal Test Global Error Handler] Error Name:', err.name);
  console.error('[Minimal Test Global Error Handler] Error Message:', err.message);
  console.error('[Minimal Test Global Error Handler] Error Stack:', err.stack);
  // Tentar obter mais detalhes do erro do Clerk se disponível
  if (err.clerkError) {
    console.error('[Minimal Test Global Error Handler] Clerk Error:', err.clerkError);
  }
  if (err.status) {
     res.status(err.status).json({ error: err.message, clerkError: err.clerkError });
  } else {
    res.status(500).json({ error: 'Something broke in minimal test!', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Minimal Clerk test server running on http://localhost:${PORT}`);
  console.log(`Ensure your .env file has correct CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY.`);
  console.log(`CLERK_JWT_KEY should remain commented out in your .env file.`);
}); 