const express = require('express');
const userQueries = require('../db/user-queries.cjs');
const passwordUtils = require('../utils/passwordUtils.cjs');
const jwtUtils = require('../utils/jwtUtils.cjs');
const { TOKEN_COOKIE_NAME } = require('./middleware/localAuth.cjs'); // Para consistência no nome do cookie

const router = express.Router();

/**
 * Rota de Login
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  console.log('[API /auth/login] Recebido pedido de login.');
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('[API /auth/login] Email ou password em falta.');
    return res.status(400).json({ error: 'Email e password são obrigatórios.' });
  }

  try {
    console.log(`[API /auth/login] A procurar utilizador: ${email}`);
    const user = await userQueries.findUserByEmailForAuth(email);

    if (!user || !user.password_hash) {
      console.warn(`[API /auth/login] Utilizador não encontrado ou sem hash para email: ${email}`);
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    console.log(`[API /auth/login] Utilizador encontrado: ${user.user_id}, a verificar password...`);

    const isPasswordValid = await passwordUtils.comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      console.warn(`[API /auth/login] Password inválida para email: ${email}`);
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    console.log(`[API /auth/login] Password válida para: ${email}. A gerar token...`);

    // Password válida, gerar token JWT
    // O payload do token deve conter informação suficiente para identificar o utilizador e as suas permissões básicas
    // mas não informação excessivamente sensível.
    const tokenPayload = {
      userId: user.user_id,
      email: user.email, // Pode ser útil para display ou logs, mas o userId é a chave
      role: user.role_name, // Incluir role para decisões de autorização no frontend/backend
      // permissions: user.permissions // Pode ser muito grande para um JWT; geralmente busca-se permissões via /api/users/me
    };

    const token = jwtUtils.generateToken(tokenPayload);
    console.log(`[API /auth/login] Token gerado. A definir cookie '${TOKEN_COOKIE_NAME}'.`);

    // Calcular data de expiração para o cookie (deve corresponder à expiração do JWT)
    // jwtUtils.JWT_EXPIRES_IN está em formato como '1d', '7h'. Precisamos converter para ms para o cookie.
    let expiresInMs;
    if (jwtUtils.JWT_EXPIRES_IN.endsWith('d')) {
      expiresInMs = parseInt(jwtUtils.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000;
    } else if (jwtUtils.JWT_EXPIRES_IN.endsWith('h')) {
      expiresInMs = parseInt(jwtUtils.JWT_EXPIRES_IN) * 60 * 60 * 1000;
    } else {
      expiresInMs = 24 * 60 * 60 * 1000; // Default para 1 dia se o formato não for reconhecido
    }

    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: expiresInMs 
    });
    console.log(`[API /auth/login] Cookie definido para ${email}. A enviar resposta de sucesso.`);

    // Enviar uma resposta de sucesso com os dados do utilizador (sem password_hash ou outras info sensíveis)
    // A rota /api/users/me será a fonte principal para obter o perfil completo.
    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role_name,
        // permissions: user.permissions // Opcional, pode ser obtido via /api/users/me
      }
    });

  } catch (error) {
    console.error('[API /auth/login] Erro durante o processo de login:', error);
    res.status(500).json({ error: 'Erro interno do servidor durante o login.' });
  }
});

/**
 * Rota de Logout
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  console.log('[API /auth/logout] Recebido pedido de logout.');
  // Limpar o cookie da sessão
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/'
  });
  console.log('[API /auth/logout] Cookie limpo. Enviando resposta de sucesso.');
  res.status(200).json({ message: 'Logout bem-sucedido.' });
});

module.exports = router; 