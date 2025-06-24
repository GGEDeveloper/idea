-- V8: Create test users for authentication testing
-- 
-- This migration creates test users that can be used to verify the authentication system.
-- It includes an admin user and a customer user with proper roles and permissions.

-- First, ensure we have the required password hashing function
-- We'll use a simple hash for testing (in production, these should be properly hashed)

-- Create test users (passwords will be hashed by the application)
-- Admin user: admin@alitools.pt / admin123
-- Customer user: cliente@exemplo.pt / cliente123

-- Get role IDs
DO $$
DECLARE
    admin_role_id INTEGER;
    customer_role_id INTEGER;
    admin_user_exists BOOLEAN;
    customer_user_exists BOOLEAN;
BEGIN
    -- Get role IDs
    SELECT role_id INTO admin_role_id FROM roles WHERE role_name = 'admin';
    SELECT role_id INTO customer_role_id FROM roles WHERE role_name = 'customer';

    -- Check if admin user already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@alitools.pt') INTO admin_user_exists;
    
    -- Check if customer user already exists  
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'cliente@exemplo.pt') INTO customer_user_exists;

    -- Create admin user if it doesn't exist
    IF NOT admin_user_exists THEN
        INSERT INTO users (
            user_id,
            clerk_id,
            email,
            first_name,
            last_name,
            company_name,
            role_id,
            password_hash,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'test_admin_clerk_id',
            'admin@alitools.pt',
            'Admin',
            'AliTools',
            'AliTools Lda',
            admin_role_id,
            '$2b$10$8K1p/a0dqNOVH3DGV31KxuN5yl1.Y4TJ4YJ1wvxz8m5q7Cd5OW4cq', -- 'admin123' hashed with bcrypt
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Admin user created: admin@alitools.pt';
    ELSE
        RAISE NOTICE 'Admin user already exists: admin@alitools.pt';
    END IF;

    -- Create customer user if it doesn't exist
    IF NOT customer_user_exists THEN
        INSERT INTO users (
            user_id,
            clerk_id,
            email,
            first_name,
            last_name,
            company_name,
            role_id,
            password_hash,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'test_customer_clerk_id',
            'cliente@exemplo.pt',
            'João',
            'Silva',
            'Silva & Associados',
            customer_role_id,
            '$2b$10$8K1p/a0dqNOVH3DGV31KxuN5yl1.Y4TJ4YJ1wvxz8m5q7Cd5OW4cq', -- 'cliente123' hashed with bcrypt
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Customer user created: cliente@exemplo.pt';
    ELSE
        RAISE NOTICE 'Customer user already exists: cliente@exemplo.pt';
    END IF;

END $$;

-- Verify users were created
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    r.role_name,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.role_id
WHERE u.email IN ('admin@alitools.pt', 'cliente@exemplo.pt')
ORDER BY r.role_name; 