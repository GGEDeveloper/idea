import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Função para garantir que as tabelas de email existem
async function ensureEmailTablesExist() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        log_id SERIAL PRIMARY KEY,
        recipient_email VARCHAR(255) NOT NULL,
        sender_email VARCHAR(255),
        subject TEXT,
        template_used VARCHAR(100),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        error_message TEXT,
        smtp_response JSONB,
        configuration_used JSONB,
        sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT check_status CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
      );

      CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
    `);
  } catch (error) {
    console.error('Erro ao criar tabela email_logs:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Criar tabela se não existir
    await ensureEmailTablesExist();

    const { test_email, use_current_config } = await request.json();

    if (!test_email) {
      return NextResponse.json(
        { error: 'Email de teste é obrigatório' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(test_email)) {
      return NextResponse.json(
        { error: 'Email de teste inválido' },
        { status: 400 }
      );
    }

    let emailConfig;

    if (use_current_config) {
      // Usar configuração atual da base de dados
      const query = `
        SELECT 
          smtp_host, smtp_port, smtp_secure, smtp_username as smtp_user, smtp_password,
          from_email, from_name, reply_to
        FROM email_configurations 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      const result = await pool.query(query);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Nenhuma configuração de email ativa encontrada' },
          { status: 400 }
        );
      }

      emailConfig = result.rows[0];
    } else {
      // Usar configuração enviada no request
      const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email, from_name } = await request.json();

      if (!smtp_host || !smtp_port || !from_email) {
        return NextResponse.json(
          { error: 'Configuração incompleta para teste' },
          { status: 400 }
        );
      }

      emailConfig = {
        smtp_host,
        smtp_port: parseInt(smtp_port),
        smtp_secure: smtp_secure === 'SSL' || smtp_secure === 'TLS',
        smtp_user,
        smtp_password,
        from_email,
        from_name: from_name || 'ALITOOLS'
      };
    }

    // Criar transporter do nodemailer
    const transporterConfig: any = {
      host: emailConfig.smtp_host,
      port: emailConfig.smtp_port,
      secure: emailConfig.smtp_secure,
    };

    if (emailConfig.smtp_user && emailConfig.smtp_password) {
      transporterConfig.auth = {
        user: emailConfig.smtp_user,
        pass: emailConfig.smtp_password,
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // Verificar conexão
    try {
      await transporter.verify();
    } catch (error: any) {
      console.error('Erro na verificação SMTP:', error);
      return NextResponse.json({
        success: false,
        error: 'Falha na conexão SMTP',
        details: error.message
      }, { status: 400 });
    }

    // Enviar email de teste
    const testEmailContent = {
      from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
      to: test_email,
      subject: '🧪 Teste de Configuração SMTP - ALITOOLS',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success { color: #059669; font-weight: bold; }
            .info { background: #e0f2fe; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Teste de Email SMTP</h1>
            </div>
            <div class="content">
              <p class="success">Parabéns! A configuração SMTP está a funcionar corretamente.</p>
              
              <div class="info">
                <strong>📧 Detalhes da Configuração Testada:</strong><br>
                <strong>Servidor:</strong> ${emailConfig.smtp_host}:${emailConfig.smtp_port}<br>
                <strong>Segurança:</strong> ${emailConfig.smtp_secure ? 'SSL/TLS' : 'STARTTLS/Nenhuma'}<br>
                <strong>Autenticação:</strong> ${emailConfig.smtp_user ? 'Sim' : 'Não'}<br>
                <strong>De:</strong> ${emailConfig.from_name} &lt;${emailConfig.from_email}&gt;
              </div>

              <p><strong>🎯 Próximos Passos:</strong></p>
              <ul>
                <li>Ativar esta configuração na página de administração</li>
                <li>Configurar templates de email personalizados</li>
                <li>Testar notificações automáticas</li>
              </ul>

              <p>Este email foi enviado automaticamente pelo sistema ALITOOLS para validar as configurações SMTP.</p>
              
              <div class="footer">
                <p>🕐 Enviado em: ${new Date().toLocaleString('pt-PT')}</p>
                <p>ALITOOLS - Sistema de Gestão B2B</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        ✅ TESTE DE EMAIL SMTP - ALITOOLS
        
        Parabéns! A configuração SMTP está a funcionar corretamente.
        
        📧 Detalhes da Configuração Testada:
        - Servidor: ${emailConfig.smtp_host}:${emailConfig.smtp_port}
        - Segurança: ${emailConfig.smtp_secure ? 'SSL/TLS' : 'STARTTLS/Nenhuma'}
        - Autenticação: ${emailConfig.smtp_user ? 'Sim' : 'Não'}
        - De: ${emailConfig.from_name} <${emailConfig.from_email}>
        
        🎯 Próximos Passos:
        - Ativar esta configuração na página de administração
        - Configurar templates de email personalizados  
        - Testar notificações automáticas
        
        Este email foi enviado automaticamente pelo sistema ALITOOLS para validar as configurações SMTP.
        
        🕐 Enviado em: ${new Date().toLocaleString('pt-PT')}
        ALITOOLS - Sistema de Gestão B2B
      `
    };

    try {
      const info = await transporter.sendMail(testEmailContent);
      
      // Log do teste na base de dados
      await pool.query(`
        INSERT INTO email_logs (
          recipient_email, subject, status, smtp_response, 
          configuration_used, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        test_email,
        testEmailContent.subject,
        'sent',
        JSON.stringify({ messageId: info.messageId, response: info.response }),
        JSON.stringify({
          smtp_host: emailConfig.smtp_host,
          smtp_port: emailConfig.smtp_port,
          from_email: emailConfig.from_email
        })
      ]);

      return NextResponse.json({
        success: true,
        message: 'Email de teste enviado com sucesso!',
        details: {
          messageId: info.messageId,
          recipient: test_email,
          response: info.response
        }
      });

    } catch (error: any) {
      console.error('Erro ao enviar email de teste:', error);
      
      // Log do erro na base de dados
      await pool.query(`
        INSERT INTO email_logs (
          recipient_email, subject, status, error_message, 
          configuration_used, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        test_email,
        testEmailContent.subject,
        'failed',
        error.message,
        JSON.stringify({
          smtp_host: emailConfig.smtp_host,
          smtp_port: emailConfig.smtp_port,
          from_email: emailConfig.from_email
        })
      ]);

      return NextResponse.json({
        success: false,
        error: 'Falha ao enviar email de teste',
        details: error.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro geral no teste de email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 