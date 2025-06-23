import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // High security level

/**
 * Hashes a plain text password
 * @param password - The plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('[passwordUtils] Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Compares a plain text password with a hashed password
 * @param plainPassword - The plain text password
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 */
export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('[passwordUtils] Error comparing password:', error);
    return false;
  }
};

/**
 * Validates password strength
 * @param password - The password to validate
 * @returns Object with validation result and messages
 */
export const validatePasswordStrength = (password: string): { 
  isValid: boolean; 
  messages: string[]; 
} => {
  const messages: string[] = [];
  
  if (password.length < 8) {
    messages.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    messages.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    messages.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    messages.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    messages.push('Password must contain at least one special character');
  }
  
  return {
    isValid: messages.length === 0,
    messages
  };
}; 