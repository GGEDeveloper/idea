import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d'; // Token expires in 1 day

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

// Type definitions
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: any;
}

/**
 * Generates a JSON Web Token.
 * @param payload - The payload to be included in the token
 * @returns The generated JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies a JSON Web Token.
 * @param token - The JWT token to be verified
 * @returns The decoded payload if the token is valid, null otherwise
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('[jwtUtils] Invalid or expired token:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

/**
 * Gets the expiration time in milliseconds for cookie configuration
 * @returns Expiration time in milliseconds
 */
export const getExpirationMs = (): number => {
  if (JWT_EXPIRES_IN.endsWith('d')) {
    return parseInt(JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000;
  } else if (JWT_EXPIRES_IN.endsWith('h')) {
    return parseInt(JWT_EXPIRES_IN) * 60 * 60 * 1000;
  } else {
    return 24 * 60 * 60 * 1000; // Default to 1 day if format is not recognized
  }
};

// Export constants
export { JWT_EXPIRES_IN }; 