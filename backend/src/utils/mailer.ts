import nodemailer from 'nodemailer';

export interface ApprovalEmailRecipient {
  email: string;
  firstName: string;
  lastName: string;
}

interface AccountStatusEmailParams {
  to: string;
  name: string;
  enabled: boolean;
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

const getMailConfig = () => {
  const host =
    process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 465);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    (user ? `"Revista HIEF" <${user}>` : '');

  if (
    !host ||
    !user ||
    !pass ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    const error = new Error(
      'La configuración SMTP/correo no está completa o no es válida.',
    );
    console.error('Error de SMTP:', error.message);
    throw error;
  }

  return { host, port, user, pass, from };
};

export const sendApprovalEmail = async (
  recipient: ApprovalEmailRecipient,
): Promise<void> => {
  const { host, port, user, pass, from } = getMailConfig();
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  const fullName = `${recipient.firstName} ${recipient.lastName}`.trim();

  try {
    await transporter.sendMail({
      from,
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

export const sendAccountStatusEmail = async ({
  to,
  name,
  enabled,
}: AccountStatusEmailParams): Promise<void> => {
  const { host, port, user, pass, from } = getMailConfig();
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  const safeName = escapeHtml(name);

  const subject = enabled
    ? 'Tu cuenta ha sido habilitada - Revista HIEF'
    : 'Tu cuenta ha sido deshabilitada - Revista HIEF';

  const text = enabled
    ? `Hola ${name}, te informamos que tu cuenta en Revista HIEF ha sido habilitada por un administrador. Ya puedes iniciar sesión con tus credenciales.`
    : `Hola ${name}, te informamos que tu cuenta en Revista HIEF ha sido deshabilitada por un administrador. Mientras permanezca deshabilitada no podrás iniciar sesión. Si necesitas más información, contacta al equipo administrador.`;

  const headingColor = enabled ? '#087d70' : '#b91c1c';
  const statusPhrase = enabled ? 'habilitada' : 'deshabilitada';
  const detailParagraph = enabled
    ? 'Ya puedes iniciar sesión con tus credenciales para participar en las convocatorias o enviar tus manuscritos.'
    : 'Mientras tu cuenta permanezca deshabilitada no podrás acceder al sistema. Si consideras que se trata de un error o necesitas más información, contacta al equipo administrador.';

  const html = `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <h2 style="color: ${headingColor};">¡Hola ${safeName}!</h2>
    <p>Te informamos que <strong>tu cuenta en Revista HIEF ha sido ${statusPhrase}</strong> por un administrador.</p>
    <p>${detailParagraph}</p>
    <p style="font-size: 12px; color: #6b7280;">Si no reconoces esta acción, contacta al administrador del sistema.</p>
  </div>`;

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
  } catch (error: unknown) {
    console.error(
      'Error de SMTP:',
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  } finally {
    transporter.close();
  }
};

export const sendActivationEmail = (
  to: string,
  name: string,
): Promise<void> => sendAccountStatusEmail({ to, name, enabled: true });

export const sendDeactivationEmail = (
  to: string,
  name: string,
): Promise<void> => sendAccountStatusEmail({ to, name, enabled: false });
