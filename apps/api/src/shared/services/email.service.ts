import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY não configurada no .env');
    }
    this.resend = new Resend(apiKey);
  }

  // ✉️ 1. Dispara o e-mail de Boas-vindas / Validação
  async sendVerificationEmail(to: string, token: string) {
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: 'Mandacaru SaaS <onboarding@resend.dev>', // O e-mail padrão de testes do Resend
      to,
      subject: '🌵 Confirme sua conta no sistema',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bem-vindo(a)!</h2>
          <p>Falta pouco para você acessar o seu painel.</p>
          <p>Clique no botão abaixo para verificar seu endereço de e-mail e ativar sua conta:</p>
          <a href="${verifyLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">
            Verificar minha conta
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #64748b;">
            Se o botão não funcionar, copie e cole este link no navegador:<br/>
            ${verifyLink}
          </p>
        </div>
      `,
    });
  }

  // 🔒 2. Dispara o e-mail de Recuperação de Senha
  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: 'Mandacaru SaaS <onboarding@resend.dev>',
      to,
      subject: '🔒 Recuperação de Senha',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Você esqueceu sua senha?</h2>
          <p>Tudo bem, imprevistos acontecem! Recebemos um pedido para redefinir a senha da sua conta.</p>
          <p>Clique no botão abaixo para criar uma senha nova. Este link é válido por apenas 1 hora.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">
            Redefinir Minha Senha
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #64748b;">
            Se você não solicitou a troca de senha, pode ignorar este e-mail com segurança. Sua conta continua protegida.
          </p>
        </div>
      `,
    });
  }
}
