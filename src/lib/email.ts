import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { configGlobal } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

let transporter: nodemailer.Transporter | null = null;
let cachedConfig: { host: string; port: number; user: string; pass: string; fromEmail: string; fromName: string } | null = null;

async function getSmtpConfig() {
  const [config] = await db.select().from(configGlobal).limit(1);
  if (!config || !config.smtpHost) return null;
  return {
    host: config.smtpHost,
    port: config.smtpPort || 587,
    user: config.smtpUser || "",
    pass: config.smtpPass || "",
    fromEmail: config.smtpFromEmail || config.smtpUser || "noreply@washmaster.com",
    fromName: config.smtpFromName || config.nombreApp || "WashMaster Pro",
  };
}

async function getTransporter() {
  const smtp = await getSmtpConfig();
  if (!smtp) return null;

  if (
    cachedConfig &&
    cachedConfig.host === smtp.host &&
    cachedConfig.port === smtp.port &&
    cachedConfig.user === smtp.user
  ) {
    return transporter;
  }

  cachedConfig = smtp;
  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: smtp.user
      ? { user: smtp.user, pass: smtp.pass }
      : undefined,
  });

  return transporter;
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const tr = await getTransporter();
    if (!tr) {
      console.warn("SMTP no configurado. Email no enviado.");
      return { success: false, error: "SMTP no configurado" };
    }

    const smtp = await getSmtpConfig();
    const info = await tr.sendMail({
      from: `"${smtp!.fromName}" <${smtp!.fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text || "",
      html: options.html,
    });

    console.log(`Email enviado: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error al enviar email:", error);
    return { success: false, error: "Error al enviar email" };
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Bienvenido a WashMaster Pro",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1a1a2e;">¡Bienvenido, ${name}!</h2>
        <p style="color:#555;line-height:1.6;">
          Tu cuenta ha sido creada exitosamente en <strong>WashMaster Pro</strong>.
        </p>
        <p style="color:#555;line-height:1.6;">
          Ya puedes iniciar sesión y comenzar a gestionar tus servicios de lavado.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login"
           style="display:inline-block;background:#1a1a2e;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:12px;">
          Iniciar Sesión
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="font-size:12px;color:#999;">WashMaster Pro — Sistema de Gestión de Autolavados</p>
      </div>
    `,
    text: `Bienvenido, ${name}!\n\nTu cuenta ha sido creada exitosamente en WashMaster Pro.\n\nInicia sesión aquí: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
  });
}

export async function sendNotificationEmail(to: string, subject: string, message: string) {
  return sendEmail({
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1a1a2e;">${subject}</h2>
        <p style="color:#555;line-height:1.6;">${message}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="font-size:12px;color:#999;">WashMaster Pro — Sistema de Gestión de Autolavados</p>
      </div>
    `,
    text: `${subject}\n\n${message}`,
  });
}
