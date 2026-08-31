"use client";

import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  accent?: boolean;
}) {
  return (
    <div className={cn("group relative overflow-hidden rounded-xl border bg-white p-5 transition-all hover:shadow-md", accent ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white" : "border-dzb-creamline")}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-dzb-muted">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-dzb-navy">
            {value}
          </p>
          {trend && trendLabel && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", trend === "up" && "bg-emerald-50 text-emerald-700", trend === "down" && "bg-red-50 text-red-600", trend === "neutral" && "bg-steel-100 text-steel-500")}>
                {trend === "up" && "↑"}
                {trend === "down" && "↓"}
                {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors", accent ? "bg-amber-100 text-amber-600" : "bg-dzb-tint text-dzb-amberink")}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({
  status,
  label,
  colors,
  size = "sm",
}: {
  status: string;
  label: string;
  colors: string;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        colors,
        size === "xs" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      )}
    >
      {label}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-dzb-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-dzb-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dzb-creamline bg-white/50 px-6 py-16 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dzb-tint text-dzb-faint">
          {icon}
        </div>
      )}
      <h3 className="mt-4 font-display text-base font-semibold text-dzb-navy">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-dzb-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-dzb-creamline/60", className)} />
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-md rounded-xl border border-dzb-creamline bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold text-dzb-navy">{title}</h3>
        {description && <p className="mt-2 text-sm text-dzb-muted">{description}</p>}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg border border-dzb-creamline bg-white px-4 py-2.5 text-sm font-medium text-dzb-muted transition-colors hover:bg-dzb-cream">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={cn("rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98]", danger ? "bg-red-500 hover:bg-red-600" : "bg-dzb-amber text-dzb-inkdark hover:bg-dzb-amberdeep")}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ message, type = "success", onDismiss }: { message: string; type?: "success" | "error" | "info"; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={cn("fixed bottom-6 right-6 z-[70] transition-all duration-300", visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>
      <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm", type === "success" && "border-emerald-200 bg-emerald-50/95 text-emerald-800", type === "error" && "border-red-200 bg-red-50/95 text-red-700", type === "info" && "border-blue-200 bg-blue-50/95 text-blue-700")}>
        <span className="text-sm font-medium">{message}</span>
        <button type="button" onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} className="ml-2 text-current opacity-50 hover:opacity-100">
          ×
        </button>
      </div>
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string; count?: number }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-dzb-cream p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-all",
            active === tab.key
              ? "bg-white text-dzb-navy shadow-sm"
              : "text-dzb-muted hover:text-dzb-navy"
          )}
        >
          {tab.label}
          {tab.count != null && (
            <span className={cn("ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold", active === tab.key ? "bg-dzb-tint text-dzb-amberink" : "bg-dzb-creamline text-dzb-faint")}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
