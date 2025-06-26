import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface PedidoCooperacaoData {
  company_name: string;
  vat_number: string;
  economic_activity_code: string;
  monthly_purchase_forecast: number;
  website_url?: string;
  billing_address: string;
  billing_postal_code: string;
  billing_city: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_position?: string;
  delivery_address?: string;
  delivery_postal_code?: string;
  delivery_city?: string;
  suppliers?: Array<{
    company_name: string;
    contact_name: string;
    phone: string;
    location: string;
  }>;
  comments?: string;
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const data: PedidoCooperacaoData = await request.json();
    
    // Validações básicas
    if (!data.company_name || !data.vat_number || !data.contact_email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta' },
        { status: 400 }
      );
    }

    // Verificar se já existe um pedido com este NIF ou email
    const existingApplication = await client.query(`
      SELECT user_id, application_status, company_name 
      FROM users 
      WHERE vat_number = $1 OR email = $2
    `, [data.vat_number, data.contact_email]);

    if (existingApplication.rows.length > 0) {
      const existing = existingApplication.rows[0];
      
      if (existing.application_status === 'application_submitted') {
        return NextResponse.json(
          { error: 'Já existe um pedido pendente para este NIF ou email' },
          { status: 409 }
        );
      } else if (existing.application_status === 'active') {
        return NextResponse.json(
          { error: 'Já existe uma conta ativa para este NIF ou email' },
          { status: 409 }
        );
      }
    }

    await client.query('BEGIN');

    // 1. Criar utilizador com status de pedido submetido
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

    // 2. Adicionar morada de facturação
    await client.query(`
      INSERT INTO customer_addresses (
        customer_id, address_type, street_address, postal_code, 
        city, country, is_primary
      ) VALUES ($1, 'billing', $2, $3, $4, 'Portugal', true)
    `, [userId, data.billing_address, data.billing_postal_code, data.billing_city]);

    // 3. Adicionar morada de entrega (se diferente)
    if (data.delivery_address && data.delivery_address.trim()) {
      await client.query(`
        INSERT INTO customer_addresses (
          customer_id, address_type, street_address, postal_code, 
          city, country, is_primary
        ) VALUES ($1, 'delivery', $2, $3, $4, 'Portugal', false)
      `, [
        userId, 
        data.delivery_address, 
        data.delivery_postal_code || '', 
        data.delivery_city || ''
      ]);
    }

    // 4. Adicionar contacto principal
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

    // 5. Adicionar fornecedores habituais (se existirem)
    if (data.suppliers && data.suppliers.length > 0) {
      for (const supplier of data.suppliers) {
        if (supplier.company_name && supplier.company_name.trim()) {
          await client.query(`
            INSERT INTO customer_suppliers (
              customer_id, company_name, contact_name, phone, location
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            userId,
            supplier.company_name,
            supplier.contact_name || null,
            supplier.phone || null,
            supplier.location || null
          ]);
        }
      }
    }

    // 6. Criar notificação para admin (versão simplificada)
    await client.query(`
      INSERT INTO admin_notifications (
        type, title, message, priority, related_entity_type, related_entity_id,
        action_url
      ) VALUES (
        'new_application',
        'Novo Pedido de Cooperação',
        $1,
        'normal',
        'customer',
        $2,
        $3
      )
    `, [
      `Nova empresa ${data.company_name} (${data.vat_number}) submeteu pedido de cooperação. Previsão mensal: €${data.monthly_purchase_forecast}`,
      userId,
      `/admin/pedidos/${userId}`
    ]);

    // 7. Log de auditoria
    await client.query(`
      INSERT INTO customer_audit_log (
        customer_id, table_affected, action_type, action_description,
        new_values, performed_by
      ) VALUES (
        $1, 'users', 'created', 'Pedido de cooperação submetido',
        $2, $1
      )
    `, [
      userId,
      JSON.stringify({
        company_name: data.company_name,
        vat_number: data.vat_number,
        application_type: 'public_form',
        has_suppliers: data.suppliers?.length || 0,
        has_delivery_address: !!data.delivery_address,
        comments: data.comments || null
      })
    ]);

    await client.query('COMMIT');

    // Resposta de sucesso (sem expor dados sensíveis)
    return NextResponse.json({
      success: true,
      message: 'Pedido de cooperação submetido com sucesso',
      reference_id: userId.substring(0, 8), // primeiros 8 caracteres do UUID como referência
    });

  } catch (error) {
    await client.query('ROLLBACK');
    
    console.error('Erro ao processar pedido de cooperação:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor. Tente novamente mais tarde.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Endpoint para verificar status de um pedido (opcional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const vat_number = searchParams.get('vat_number');

  if (!email && !vat_number) {
    return NextResponse.json(
      { error: 'Email ou NIF necessário para consulta' },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(`
      SELECT 
        application_status,
        company_name,
        application_date,
        rejection_reason
      FROM users 
      WHERE email = $1 OR vat_number = $2
      ORDER BY application_date DESC
      LIMIT 1
    `, [email, vat_number]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum pedido encontrado' },
        { status: 404 }
      );
    }

    const application = result.rows[0];
    
    return NextResponse.json({
      status: application.application_status,
      company_name: application.company_name,
      submitted_date: application.application_date,
      rejection_reason: application.rejection_reason || null
    });

  } catch (error) {
    console.error('Erro ao consultar status:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 