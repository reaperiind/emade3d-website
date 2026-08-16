/**
 * New-order email notification.
 *
 * When a customer submits an order, an elegant HTML email is sent to the site
 * owner via SMTP using nodemailer. Credentials come from environment variables:
 *
 *   EMAIL_USER  – Gmail address used as the sender (requires an app password)
 *   EMAIL_PASS  – the Gmail App Password for the sender
 *   EMAIL_TO    – recipient(s) for the notifications (comma separated)
 *   EMAIL_HOST  – SMTP host, e.g. smtp.gmail.com (default)
 *   EMAIL_PORT  – SMTP port, 465 (default)
 *   APP_URL     – base URL used for links in the email (default: portal)
 *
 * Sending is best-effort: the order API must not fail because the mail could
 * not be sent, so errors are swallowed and logged.
 */

import nodemailer from "nodemailer";
import type { Order } from "@/lib/orders-store";

const HOST = process.env.EMAIL_HOST ?? "smtp.gmail.com";
const PORT = Number(process.env.EMAIL_PORT ?? 465);
const USER = process.env.EMAIL_USER ?? "";
const PASS = process.env.EMAIL_PASS ?? "";
const TO_LIST = (process.env.EMAIL_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const APP_URL = (process.env.APP_URL ?? "https://portal.emade3d.store").replace(
  /\/+(fr|en|ar)?\/?$/,
  ""
);
/** Admin panel URL used in notification links. */
const ADMIN_URL = `${APP_URL}/admin`;

const SERVICE_LABELS: Record<string, string> = {
  IMPRESSION_3D: "Impression 3D",
  CONCEPTION_3D: "Conception 3D",
  CONCEPTION_AND_IMPRESSION: "Conception + Impression 3D",
};

function deliveryLabel(order: Order): string {
  const d = order.delivery;
  if (!d || d.method === "pickup") return "Retrait sur place";
  if (d.option === "home") return `Livraison à domicile${d.address ? ` — ${d.address}` : ""}`;
  return `Bureau du coursier${d.wilayaId != null ? ` — wilaya ${d.wilayaId}` : ""}`;
}

/** Escapes HTML-special characters from user-provided content. */
function esc(value: string | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Plain-text summary used as the email fallback body. */
export function formatOrderText(order: Order): string {
  const lines = [
    `Client : ${order.firstName} ${order.lastName}`,
    `Téléphone : ${order.phone}`,
    `Code de suivi : ${order.code}`,
    `Service : ${SERVICE_LABELS[order.serviceType] ?? order.serviceType}`,
  ];
  if (order.orderDate) lines.push(`Date de la commande : ${order.orderDate}`);
  lines.push(`Livraison : ${deliveryLabel(order)}`);
  if (order.files?.length) {
    lines.push(
      `Fichiers joints (${order.files.length}) : ${order.files
        .map((f) => f.name)
        .join(", ")}`
    );
  }
  lines.push("");
  lines.push(`Description du projet :`);
  lines.push(order.description);
  return lines.join("\n");
}

interface DetailRow {
  label: string;
  value: string;
}

/** Builds the order summary rows shown in the email. */
function buildDetails(order: Order): DetailRow[] {
  const serviceLabel = SERVICE_LABELS[order.serviceType] ?? order.serviceType;
  const rows: DetailRow[] = [
    { label: "Client", value: `${order.firstName} ${order.lastName}` },
    { label: "Téléphone", value: order.phone },
    { label: "Code de suivi", value: order.code },
    { label: "Service", value: serviceLabel },
  ];
  if (order.orderDate) rows.push({ label: "Date de la commande", value: order.orderDate });
  rows.push({ label: "Livraison", value: deliveryLabel(order) });
  if (order.files?.length) {
    rows.push({
      label: "Fichiers",
      value: order.files.map((f) => f.name).join(", "),
    });
  }
  return rows;
}

/**
 * Builds a polished, responsive HTML email. All styling is inline so it
 * renders consistently across Gmail, Outlook and mobile clients.
 */
export function formatOrderHtml(order: Order): string {
  const details = buildDetails(order);
  const detailsRows = details
    .map(
      (row) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#5b6470;font-size:13px;white-space:nowrap;vertical-align:top;">${esc(row.label)}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#101828;font-size:13px;font-weight:600;vertical-align:top;word-break:break-word;">${esc(row.value)}</td>
        </tr>`
    )
    .join("\n");

  const filesNote =
    order.files?.length
      ? `<p style="margin:0 0 4px;color:#5b6470;font-size:12px;">${order.files.length} fichier(s) joint(s) à consulter dans l'admin.</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Nouvelle commande</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#0f172a,#1e3a8a);border-radius:16px 16px 0 0;padding:32px 32px 28px;text-align:center;">
                <p style="margin:0 0 8px;color:#38bdf8;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Emade3D</p>
                <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">Nouvelle commande reçue</h1>
                <p style="margin:8px 0 0;color:#cbd5e1;font-size:13px;">Une commande vient d'être déposée sur votre site.</p>
              </td>
            </tr>

            <!-- Code badge -->
            <tr>
              <td style="background:#ffffff;padding:0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:-24px;">
                  <tr>
                    <td align="center">
                      <div style="display:inline-block;background:#eef6ff;border:1px solid #b3d9ff;border-radius:12px;padding:14px 28px;text-align:center;">
                        <p style="margin:0;color:#5b6470;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">Code de suivi</p>
                        <p style="margin:4px 0 0;color:#0f172a;font-family:'Courier New',monospace;font-size:28px;font-weight:700;letter-spacing:2px;">${esc(order.code)}</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Details -->
            <tr>
              <td style="background:#ffffff;padding:24px 32px 8px;">
                <h2 style="margin:0 0 16px;color:#101828;font-size:16px;font-weight:700;">Détails de la commande</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eef1f5;border-radius:12px;overflow:hidden;">
                  ${detailsRows}
                </table>
              </td>
            </tr>

            <!-- Description -->
            <tr>
              <td style="background:#ffffff;padding:16px 32px 8px;">
                <h2 style="margin:0 0 8px;color:#101828;font-size:16px;font-weight:700;">Description du projet</h2>
                <p style="margin:0;color:#344054;font-size:13px;line-height:1.6;white-space:pre-wrap;">${esc(order.description)}</p>
              </td>
            </tr>

            ${filesNote ? `
            <tr>
              <td style="background:#ffffff;padding:16px 32px 0;">
                <p style="margin:0;padding:12px 16px;background:#fefce8;border:1px solid #fde68a;border-radius:10px;color:#92400e;font-size:12.5px;line-height:1.5;">${filesNote}</p>
              </td>
            </tr>` : ""}

            <!-- CTA -->
            <tr>
              <td style="background:#ffffff;padding:28px 32px 32px;text-align:center;">
                <a href="${ADMIN_URL}" target="_blank" rel="noopener" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">
                  Voir dans l'admin
                </a>
                <p style="margin:16px 0 0;color:#98a2b3;font-size:12px;">
                  <a href="${ADMIN_URL}" style="color:#98a2b3;">${esc(ADMIN_URL)}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f4f6f9;border-radius:0 0 16px 16px;padding:20px 32px 8px;text-align:center;">
                <p style="margin:0;color:#98a2b3;font-size:12px;line-height:1.6;">Cet e-mail est une notification automatique envoyée depuis<br/>le site Emade3D.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Sends the "new order" notification email. Never throws. */
export async function notifyNewOrder(order: Order): Promise<void> {
  if (!USER || !PASS || TO_LIST.length === 0) return;

  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });

  const subject = `Nouvelle commande ${order.code} — ${order.firstName} ${order.lastName}`;
  const text = [
    "Une nouvelle commande vient d'être reçue.",
    "",
    formatOrderText(order),
    "",
    `Consulter dans l'admin : ${ADMIN_URL}`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: `Emade3D <${USER}>`,
      to: TO_LIST.join(", "),
      subject,
      text,
      html: formatOrderHtml(order),
    });
  } catch (err) {
    // Best-effort: never break the order submission flow.
    console.error("[email] failed to send new-order notification", err);
  }
}