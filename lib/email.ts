import nodemailer from "nodemailer";

// Configurar transporter (exemplo com Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password para Gmail
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Recuperação de senha",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de senha</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Recuperação de Senha</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">
            Olá!
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Você solicitou uma recuperação de senha para sua conta. Clique no botão abaixo para definir uma nova senha:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
              Redefinir Senha
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
            Ou copie e cole este link em seu navegador:
          </p>
          <p style="font-size: 14px; color: #667eea; word-break: break-all; background: #e8e8e8; padding: 10px; border-radius: 3px;">
            ${resetUrl}
          </p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>⚠️ Importante:</strong> Este link expira em 15 minutos por segurança.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Se você não solicitou esta recuperação de senha, ignore este e-mail. Sua senha permanecerá inalterada.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            © ${new Date().getFullYear()} Sua Empresa. Todos os direitos reservados.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
      Recuperação de Senha
      
      Você solicitou uma recuperação de senha para sua conta.
      
      Acesse este link para definir uma nova senha:
      ${resetUrl}
      
      Este link expira em 15 minutos por segurança.
      
      Se você não solicitou esta recuperação, ignore este e-mail.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("E-mail de recuperação enviado para:", email);
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    throw new Error("Falha ao enviar e-mail");
  }
}
