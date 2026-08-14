"use client";

import { site } from "@/config/site";
import type { Order } from "@/lib/orders-store";

const ACCENT = "#FF5A1F";
const INK = "#0B0E14";

/**
 * Draws a receipt (visa / bon de commande) to a canvas and downloads it as a
 * PNG. Uses the native Canvas API so no extra dependency is required.
 */
export function downloadOrderReceipt(order: Order, siteName?: string) {
  const W = 600;
  const H = 470;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, W, H);

  // Accent top band with brand
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, 96);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 88, W, 8);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "800 28px 'Segoe UI', system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(siteName ?? site.name, 40, 48);

  ctx.font = "500 15px 'Segoe UI', system-ui, sans-serif";
  ctx.fillStyle = "#E6EAF0";
  ctx.fillText("Bon de commande / Order receipt", 40, 76);

  // Body
  const bodyStart = 120;
  const labelX = 40;
  const valueX = 230;

  ctx.textBaseline = "alphabetic";
  const rows: Array<[string, string]> = [
    ["Client", `${order.firstName} ${order.lastName}`],
    ["Téléphone", order.phone],
    ["Service", order.serviceType.replace(/_/g, " ")],
    ["Date", order.orderDate ?? new Date(order.createdAt).toLocaleDateString("fr-FR")],
    ["Référence", new Date(order.createdAt).toLocaleString("fr-FR")],
  ];

  let y = bodyStart;
  for (const [label, value] of rows) {
    ctx.fillStyle = "#8A93A0";
    ctx.font = "600 14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(label, labelX, y);
    ctx.fillStyle = "#23272E";
    ctx.font = "500 14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(value, valueX, y);
    // divider
    ctx.strokeStyle = "#EDEFF2";
    ctx.beginPath();
    ctx.moveTo(40, y + 18);
    ctx.lineTo(W - 40, y + 18);
    ctx.stroke();
    y += 46;
  }

  // Tracking code panel
  const codeY = y + 12;
  ctx.fillStyle = "#F4F6F8";
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, codeY, W - 80, 74, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#23272E";
  ctx.font = "600 13px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("CODE DE SUIVI / TRACKING CODE", 60, codeY + 26);

  ctx.fillStyle = INK;
  ctx.font = "800 30px 'Consolas', 'Courier New', monospace";
  ctx.fillText(order.code, 60, codeY + 56);

  const noteY = H - 34;
  ctx.fillStyle = "#8A93A0";
  ctx.font = "500 12px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `Merci de nous avoir fait confiance ! ${site.name} — www.emade3d.com`,
    W / 2,
    noteY
  );
  ctx.textAlign = "left";

  const link = document.createElement("a");
  link.download = `${order.code}-recepisse.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}