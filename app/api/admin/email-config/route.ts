import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});



// GET: Obter configurações de email
export async function GET() {
  try {
    const query = `
      SELECT 
        config_id,
        smtp_host,
        smtp_port,
        smtp_secure,
        smtp_username as smtp_user,
        smtp_password,
        from_email,
        from_name,
        reply_to,
        is_active as is_enabled,
        created_at,
        updated_at
      FROM email_configurations 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      // Criar configuração padrão se não existir
      const defaultConfig = {
        smtp_host: '',
        smtp_port: 587,
        smtp_secure: false,
        smtp_user: '',
        smtp_password: '',
        from_email: 'noreply@alitools.pt',
        from_name: 'ALITOOLS',
        reply_to: 'support@alitools.pt',
        is_enabled: false
      };

      return NextResponse.json({
        exists: false,
        config: defaultConfig
      });
    }

    const config = result.rows[0];
    
    // Não retornar password por segurança
    const { smtp_password, ...safeConfig } = config;
    
    return NextResponse.json({
      exists: true,
      config: {
        ...safeConfig,
        has_password: !!smtp_password
      }
    });

  } catch (error) {
    console.error('Erro ao buscar configurações de email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST: Criar nova configuração
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_password,
      from_email,
      from_name,
      reply_to,
      is_enabled
    } = body;

    // Validações básicas
    if (!smtp_host || !smtp_port || !from_email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: smtp_host, smtp_port, from_email' },
        { status: 400 }
      );
    }

    if (smtp_port < 1 || smtp_port > 65535) {
      return NextResponse.json(
        { error: 'Porta SMTP deve estar entre 1 e 65535' },
        { status: 400 }
      );
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from_email)) {
      return NextResponse.json(
        { error: 'Email "from" inválido' },
        { status: 400 }
      );
    }

    if (reply_to && !emailRegex.test(reply_to)) {
      return NextResponse.json(
        { error: 'Email "reply_to" inválido' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Desabilitar configurações existentes se a nova for enabled
      if (is_enabled) {
        await client.query(`
          UPDATE email_configurations 
          SET is_active = false, updated_at = NOW()
        `);
      }

      // Inserir nova configuração
      const insertQuery = `
        INSERT INTO email_configurations (
          smtp_host, smtp_port, smtp_secure, smtp_username, smtp_password,
          from_email, from_name, reply_to, is_active, config_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING config_id, created_at
      `;

      const result = await client.query(insertQuery, [
        smtp_host,
        parseInt(smtp_port),
        !!smtp_secure ? 'SSL' : 'STARTTLS',
        smtp_user || null,
        smtp_password || null,
        from_email,
        from_name || 'ALITOOLS',
        reply_to || from_email,
        !!is_enabled,
        'Default SMTP Config'
      ]);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        config_id: result.rows[0].config_id,
        message: 'Configuração de email criada com sucesso'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao criar configuração de email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// TODO: Implementar PUT para atualizar configurações 