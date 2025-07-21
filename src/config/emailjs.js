// Configuração EmailJS
export const EMAILJS_CONFIG = {
    // SUBSTITUA PELOS SEUS DADOS DO EMAILJS:
    SERVICE_ID: 'service_sendgrid',     // Seu Service ID do EmailJS
    TEMPLATE_ID: 'template_test',       // Seu Template ID do EmailJS  
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY'       // Sua Public Key do EmailJS
}

// Template de email para teste SMTP
export const EMAIL_TEMPLATE = {
    subject: '🧪 Teste SMTP - Sistema Funcionando!',
    getHtmlContent: (testEmail, apiKey) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981; text-align: center;">✅ Teste SMTP Realizado com Sucesso!</h2>
            
            <p>Este email confirma que sua configuração SMTP está funcionando corretamente.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>🔧 Provedor:</strong> SendGrid API via EmailJS</p>
                <p><strong>📧 Email de teste:</strong> ${testEmail}</p>
                <p><strong>📅 Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                <p><strong>🔑 API Key:</strong> ${apiKey.substring(0, 10)}...</p>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
                Sistema de notificações - Banco de Modelos<br>
                Este é um email automático de teste.
            </p>
        </div>
    `,
    getTextContent: (testEmail, apiKey) => `
✅ Teste SMTP Realizado com Sucesso!

Este email confirma que sua configuração SMTP está funcionando corretamente.

🔧 Provedor: SendGrid API via EmailJS
📧 Email de teste: ${testEmail}
📅 Data/Hora: ${new Date().toLocaleString('pt-BR')}
🔑 API Key: ${apiKey.substring(0, 10)}...

Sistema de notificações - Banco de Modelos
Este é um email automático de teste.
    `
} 