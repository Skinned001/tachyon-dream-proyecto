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
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const port = Number(SMTP_PORT);
  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASS ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error('La configuración SMTP no está completa o no es válida.');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const fullName = `${recipient.firstName} ${recipient.lastName}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `"Chief Journal HIEF" <${SMTP_USER}>`,
    to: recipient.email,
    subject: 'Cuenta aprobada - Chief Journal',
    text: `Hola ${fullName}, tu solicitud fue aprobada por el Comité Editorial. Ya puedes iniciar sesión con tus credenciales.`,
    html: `<h3>¡Bienvenido al Chief Journal, ${escapeHtml(fullName)}!</h3>
      <p>Su solicitud ha sido aprobada por el Comité Editorial.</p>
      <p>Ya puede iniciar sesión con sus credenciales.</p>`,
  });
};
