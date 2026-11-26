import nodemailer from 'nodemailer';

export interface ApprovalEmailRecipient {
  email: string;
  firstName: string;
  lastName: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });

export const sendApprovalEmail = async (
  recipient: ApprovalEmailRecipient,
): Promise<void> => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 465);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (
    !host ||
    !user ||
    !pass ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error('La configuración SMTP no está completa o no es válida.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  const fullName = `${recipient.firstName} ${recipient.lastName}`;

  try {
    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ??
        process.env.EMAIL_FROM ??
        `"Revista HIEF" <${user}>`,
      to: recipient.email,
      subject: 'Tu cuenta ha sido activada - Revista HIEF',
      text: `Hola ${fullName}, tu solicitud fue aprobada por el Comité Editorial y tu cuenta en Revista HIEF ha sido activada. Ya puedes iniciar sesión con tus credenciales.`,
      html: `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #087d70;">¡Bienvenido a Revista HIEF, ${escapeHtml(fullName)}!</h2>
        <p>Tu solicitud de registro fue aprobada por el Comité Editorial y <strong>tu cuenta ha sido activada</strong>.</p>
        <p>Ya puedes iniciar sesión con tus credenciales.</p>
      </div>`,
    });
  } finally {
    transporter.close();
  }
};
