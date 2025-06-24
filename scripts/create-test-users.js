require('dotenv').config();
const pool = require('../db/index.cjs');
const { hashPassword } = require('../src/utils/passwordUtils.cjs');

async function createTestUsers() {
  console.log('[create-test-users] Starting test user creation...');
  
  try {
    // Hash the passwords
    const adminPasswordHash = await hashPassword('admin123');
    const customerPasswordHash = await hashPassword('cliente123');
    
    console.log('[create-test-users] Passwords hashed successfully');

    // Get role IDs
    const rolesQuery = `
      SELECT role_id, role_name FROM roles 
      WHERE role_name IN ('admin', 'customer')
      ORDER BY role_name
    `;
    
    const rolesResult = await pool.query(rolesQuery);
    console.log('[create-test-users] Found roles:', rolesResult.rows);
    
    if (rolesResult.rows.length !== 2) {
      throw new Error('Missing required roles. Expected admin and customer roles.');
    }
    
    const adminRole = rolesResult.rows.find(r => r.role_name === 'admin');
    const customerRole = rolesResult.rows.find(r => r.role_name === 'customer');
    
    console.log('[create-test-users] Admin role ID:', adminRole.role_id);
    console.log('[create-test-users] Customer role ID:', customerRole.role_id);

    // Check if users already exist
    const existingUsersQuery = `
      SELECT email FROM users 
      WHERE email IN ('admin@alitools.pt', 'cliente@exemplo.pt')
    `;
    
    const existingUsers = await pool.query(existingUsersQuery);
    const existingEmails = existingUsers.rows.map(row => row.email);
    
    console.log('[create-test-users] Existing users:', existingEmails);

    // Create admin user if it doesn't exist
    if (!existingEmails.includes('admin@alitools.pt')) {
      const adminInsertQuery = `
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
          $1,
          $2,
          NOW(),
          NOW()
        ) RETURNING user_id, email
      `;
      
      const adminResult = await pool.query(adminInsertQuery, [adminRole.role_id, adminPasswordHash]);
      console.log('[create-test-users] ✅ Admin user created:', adminResult.rows[0]);
    } else {
      console.log('[create-test-users] ⚠️ Admin user already exists: admin@alitools.pt');
    }

    // Create customer user if it doesn't exist
    if (!existingEmails.includes('cliente@exemplo.pt')) {
      const customerInsertQuery = `
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
          $1,
          $2,
          NOW(),
          NOW()
        ) RETURNING user_id, email
      `;
      
      const customerResult = await pool.query(customerInsertQuery, [customerRole.role_id, customerPasswordHash]);
      console.log('[create-test-users] ✅ Customer user created:', customerResult.rows[0]);
    } else {
      console.log('[create-test-users] ⚠️ Customer user already exists: cliente@exemplo.pt');
    }

    // Verify created users
    const verificationQuery = `
      SELECT 
        u.email,
        u.first_name,
        u.last_name,
        u.company_name,
        r.role_name,
        u.created_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      WHERE u.email IN ('admin@alitools.pt', 'cliente@exemplo.pt')
      ORDER BY r.role_name
    `;
    
    const verificationResult = await pool.query(verificationQuery);
    
    console.log('\n[create-test-users] ✅ Test users verification:');
    verificationResult.rows.forEach(user => {
      console.log(`  📧 ${user.email} (${user.role_name}) - ${user.first_name} ${user.last_name}`);
      console.log(`     🏢 ${user.company_name}`);
      console.log(`     📅 Created: ${user.created_at}`);
      console.log('');
    });

    console.log('[create-test-users] ✅ Test users setup completed successfully!');
    console.log('\n🔑 Login credentials:');
    console.log('   👑 Admin: admin@alitools.pt / admin123');
    console.log('   👤 Customer: cliente@exemplo.pt / cliente123');

  } catch (error) {
    console.error('[create-test-users] ❌ Error creating test users:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('\n[create-test-users] Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n[create-test-users] Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestUsers }; 