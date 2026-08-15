/**
 * New-order email notification.
 *
 * When a customer submits an order, an email is sent to the site owner via
 * SMTP using nodemailer. Credentials come from environment variables:
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

/** Returns a small plain-text summary used as the email body. */
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

/** Sends the "new order" notification email. Never throws. */
export async function notifyNewOrder(order: Order): Promise<void> {
  if (!USER || !PASS || TO_LIST.length === 0) return;

  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },
  });

  const text = formatOrderText(order);
  const body = [
    "Une nouvelle commande vient d'être reçue.",
    "",
    text,
    "",
    `Consulter dans l'admin : ${ADMIN_URL}`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: `Emade3D <${USER}>`,
      to: TO_LIST.join(", "),
      subject: `Nouvelle commande ${order.code} — ${order.firstName} ${order.lastName}`,
      text: body,
    });
  } catch (err) {
    // Best-effort: never break the order submission flow.
    console.error("[email] failed to send new-order notification", err);
  }
}