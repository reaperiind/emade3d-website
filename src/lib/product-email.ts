/**
 * Product purchase request email notification.
 *
 * Reuses the same SMTP environment variables as order-email.ts (EMAIL_USER,
 * EMAIL_PASS, EMAIL_TO, EMAIL_HOST, EMAIL_PORT). Best-effort: failures are
 * swallowed so the purchase flow never breaks.
 */

import nodemailer from "nodemailer";
import type { ProductOrder } from "@/lib/product-orders-store";
import type { Product } from "@/data/products";
import { localized } from "@/lib/localize";

const HOST = process.env.EMAIL_HOST ?? "smtp.gmail.com";
const PORT = Number(process.env.EMAIL_PORT ?? 465);
const USER = process.env.EMAIL_USER ?? "";
const PASS = process.env.EMAIL_PASS ?? "";
const TO_LIST = (process.env.EMAIL_TO ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const APP_URL = (process.env.APP_URL ?? "https://portal.emade3d.store").replace(
  /\/+(fr|en|ar)?\/?$/,
  ""
);
const ADMIN_URL = `${APP_URL}/admin`;

function esc(value: string | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Product display name for the request locale, falling back to the slug. */
export function productLabel(product: Product | undefined, locale: string): string {
  if (!product) return "Produit inconnu";
  return localized(product.name, locale as "fr" | "en" | "ar") || product.slug;
}

export async function notifyProductOrder(
  order: ProductOrder,
  product?: Product
): Promise<void> {
  if (!USER || !PASS || TO_LIST.length === 0) return;

  const name = productLabel(product, order.locale);
  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });

  const subject = `Nouvelle demande produit — ${name} · ${order.customerName}`;
  const text = [
    "Une nouvelle demande de produit vient d'être reçue.",
    "",
    "---",
    `Produit : ${name}`,
    `Client : ${order.customerName}`,
    `Téléphone : ${order.phone}`,
    `Quantité : ${order.quantity}`,
    order.notes ? `Remarque : ${order.notes}` : "",
    "",
    `Consulter dans l'admin : ${ADMIN_URL}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr" dir="ltr">
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e3a8a);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
              <p style="margin:0 0 6px;color:#38bdf8;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Emade3D</p>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Demande de produit reçue</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:24px 32px 32px;border-radius:0 0 16px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eef1f5;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#5b6470;font-size:13px;white-space:nowrap;">Produit</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#101828;font-size:13px;font-weight:600;">${esc(name)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#5b6470;font-size:13px;white-space:nowrap;">Client</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#101828;font-size:13px;font-weight:600;">${esc(order.customerName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#5b6470;font-size:13px;white-space:nowrap;">Téléphone</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#101828;font-size:13px;font-weight:600;">${esc(order.phone)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#5b6470;font-size:13px;white-space:nowrap;">Quantité</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #eef1f5;color:#101828;font-size:13px;font-weight:600;">${order.quantity}</td>
                </tr>
                ${order.notes ? `
                <tr>
                  <td style="padding:12px 16px;color:#5b6470;font-size:13px;white-space:nowrap;">Remarque</td>
                  <td style="padding:12px 16px;color:#101828;font-size:13px;font-weight:600;">${esc(order.notes)}</td>
                </tr>` : ""}
              </table>
              <div style="margin-top:24px;text-align:center;">
                <a href="${ADMIN_URL}" target="_blank" rel="noopener" style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:10px;">
                  Voir dans l'admin
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  try {
    await transporter.sendMail({
      from: `Emade3D <${USER}>`,
      to: TO_LIST.join(", "),
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("[email] failed to send product-order notification", err);
  }
}