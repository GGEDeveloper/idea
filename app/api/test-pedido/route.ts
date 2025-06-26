import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const data = await request.json();
    console.log('📝 Dados recebidos:', data);

    // Teste 1: Verificar conexão
    await client.query('SELECT 1');
    console.log('✅ Conexão BD OK');

    // Teste 2: Verificar se utilizador já existe
    const existingCheck = await client.query(
      'SELECT user_id FROM users WHERE vat_number = $1 OR email = $2',
      [data.vat_number, data.contact_email]
    );
    console.log('✅ Verificação duplicados OK, encontrados:', existingCheck.rows.length);

    await client.query('BEGIN');
    console.log('✅ Transação iniciada');

    // Teste 3: Criar utilizador básico
    const userResult = await client.query(`
      INSERT INTO users (
        email, first_name, last_name, company_name, role_id,
        application_status, vat_number, economic_activity_code,
        monthly_purchase_forecast, website_url, application_date,
        is_active, phone
      ) VALUES (
        $1, $2, $3, $4, 2,
        'application_submitted', $5, $6, $7, $8, NOW(), false, $9
      ) RETURNING user_id
    `, [
      data.contact_email,
      data.contact_name.split(' ')[0] || data.contact_name,
      data.contact_name.split(' ').slice(1).join(' ') || '',
      data.company_name,
      data.vat_number,
      data.economic_activity_code,
      data.monthly_purchase_forecast,
      data.website_url || null,
      data.contact_phone
    ]);
    const userId = userResult.rows[0].user_id;
    console.log('✅ Utilizador criado:', userId);

    // Teste 4: Adicionar morada
    await client.query(`
      INSERT INTO customer_addresses (
        customer_id, address_type, street_address, postal_code, 
        city, country, is_primary
      ) VALUES ($1, 'billing', $2, $3, $4, 'Portugal', true)
    `, [userId, data.billing_address, data.billing_postal_code, data.billing_city]);
    console.log('✅ Morada adicionada');

    // Teste 5: Adicionar contacto
    await client.query(`
      INSERT INTO customer_contacts (
        customer_id, contact_type, contact_name, phone, email, 
        position, is_primary
      ) VALUES ($1, 'primary', $2, $3, $4, $5, true)
    `, [
      userId, 
      data.contact_name, 
      data.contact_phone, 
      data.contact_email, 
      data.contact_position || null
    ]);
    console.log('✅ Contacto adicionado');

    // Teste 6: Notificação (versão simplificada)
    await client.query(`
      INSERT INTO admin_notifications (
        type, title, message, priority
      ) VALUES (
        'new_application',
        'Novo Pedido de Cooperação - TESTE',
        $1,
        'normal'
      )
    `, [`Nova empresa ${data.company_name} submeteu pedido de teste`]);
    console.log('✅ Notificação criada');

    await client.query('COMMIT');
    console.log('✅ Transação confirmada');

    return NextResponse.json({
      success: true,
      message: 'Teste concluído com sucesso',
      user_id: userId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro detalhado:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro no teste',
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
} 