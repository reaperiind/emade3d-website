"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/orders-store";
import type { HistoryEntry } from "@/lib/order-flows";
import { OrdersPanel } from "../orders-panel";
import { useAdminToken } from "../admin-shell";

export default function AdminOrdersPage() {
  const token = useAdminToken();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) return null;
        const json = await res.json();
        return (json.orders ?? []) as Order[];
      })
      .then((data) => {
        if (!cancelled && data) setOrders(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const patchOrder = useCallback(
    async (code: string, body: Record<string, unknown>) => {
      let before: Order[] = [];
      // Capture current orders at call time, not render time
      await new Promise<void>((resolve) => {
        setOrders((prev) => {
          before = prev;
          resolve();
          return prev;
        });
      });
      const res = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.order as Order | undefined;
        if (updated) {
          setOrders((prev) =>
            prev.map((o) => (o.code === code ? updated : o))
          );
          return;
        }
      }
      // Rollback on error
      setOrders(before);
    },
    [token]
  );

  function setStatus(code: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) =>
        o.code === code
          ? {
              ...o,
              status,
              history: [...o.history, { status, at: new Date().toISOString() }],
            }
          : o
      )
    );
    patchOrder(code, { status });
  }

  function setPrice(code: string, raw: string) {
    const value = raw.trim() === "" ? null : parseFloat(raw);
    const next = Number.isFinite(value as number) ? (value as number) : null;
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, price: next } : o))
    );
    patchOrder(code, { price: next });
  }

  function setDeliveryFee(code: string, raw: string) {
    const value = parseFloat(raw);
    const fee = Number.isFinite(value) ? value : 0;
    setOrders((prev) =>
      prev.map((o) =>
        o.code === code && o.delivery
          ? { ...o, delivery: { ...o.delivery, fee } }
          : o
      )
    );
    const order = orders.find((o) => o.code === code);
    if (order?.delivery) {
      patchOrder(code, {
        delivery: { ...order.delivery, fee },
      });
    }
  }

  function setHistoryAt(code: string, index: number, value: string) {
    const order = orders.find((o) => o.code === code);
    if (!order) return;
    const history: HistoryEntry[] = order.history.map((h, i) =>
      i === index ? { ...h, at: new Date(value).toISOString() } : h
    );
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, history } : o))
    );
    patchOrder(code, { history });
  }

  function removeHistoryAt(code: string, index: number) {
    const order = orders.find((o) => o.code === code);
    if (!order || order.history.length <= 1) return;
    const history = order.history.filter((_, i) => i !== index);
    const status = history[history.length - 1].status;
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, history, status } : o))
    );
    patchOrder(code, { history, status });
  }

  function setFiles(code: string, files: Order["files"]) {
    setOrders((prev) =>
      prev.map((o) => (o.code === code ? { ...o, files } : o))
    );
    patchOrder(code, { files });
  }

  async function onDelete(code: string) {
    if (!window.confirm(`Supprimer la commande ${code} ?`)) return;
    try {
      await fetch(`/api/orders/${encodeURIComponent(code)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o.code !== code));
    } catch {
      /* ignore */
    }
  }

  function refreshOrders() {
    if (!token) return;
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) return null;
        const json = await res.json();
        return (json.orders ?? []) as Order[];
      })
      .then((data) => {
        if (data) setOrders(data);
      })
      .catch(() => undefined);
  }

  return (
    <OrdersPanel
      orders={orders}
      loading={loading}
      token={token}
      onStatus={setStatus}
      onPrice={setPrice}
      onDeliveryFee={setDeliveryFee}
      onHistoryAt={setHistoryAt}
      onHistoryRemove={removeHistoryAt}
      onDelete={onDelete}
      onFilesChange={setFiles}
      onSave={refreshOrders}
    />
  );
}
