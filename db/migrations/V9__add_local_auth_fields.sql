-- V9: Add local authentication fields to users table
-- This migration adds the necessary fields for local JWT authentication

BEGIN;

-- Add password_hash column for local authentication
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Add is_active column to enable/disable users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add phone column (optional field for users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Make clerk_id nullable since we're now supporting local auth
ALTER TABLE users 
ALTER COLUMN clerk_id DROP NOT NULL;

-- Update existing users to be active by default
UPDATE users 
SET is_active = true 
WHERE is_active IS NULL;

-- Create index on email for faster lookups during authentication
CREATE INDEX IF NOT EXISTS idx_users_email_active 
ON users(email, is_active);

COMMIT; 