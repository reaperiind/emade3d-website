"use client";

import { useCallback, useEffect } from "react";
import { cn } from "@/lib/cn";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/components/ui/icons";

/**
 * Fullscreen image lightbox.
 *
 * Shows a single image enlarged over a dimmed backdrop, with previous / next
 * arrows to navigate a list of image URLs. Supports keyboard navigation
 * (arrows + Escape), body scroll locking and RTL-aware arrow placement.
 */
export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  label,
}: {
  images: string[];
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
  /** Optional caption shown under the image (e.g. project title). */
  label?: string;
}) {
  const count = images.length;
  const current = images[Math.min(Math.max(index, 0), count - 1)];

  const prev = useCallback(() => {
    if (count <= 1) return;
    onIndex((index - 1 + count) % count);
  }, [count, index, onIndex]);

  const next = useCallback(() => {
    if (count <= 1) return;
    onIndex((index + 1) % count);
  }, [count, index, onIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, prev, next]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label ?? "Aperçu de l'image"}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15"
      >
        <CloseIcon className="h-5 w-5" />
      </button>

      {/* Previous */}
      {count > 1 && (
        <button
          type="button"
          aria-label="Image précédente"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute start-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 sm:start-6 sm:h-14 sm:w-14"
        >
          <ArrowLeftIcon className="h-6 w-6 rtl:rotate-180" />
        </button>
      )}

      {/* Image */}
      <div
        className="flex max-h-full max-w-full flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={label ?? ""}
          className="max-h-[82vh] max-w-[92vw] rounded-lg object-contain shadow-2xl shadow-black/60"
        />
        {label && (
          <p className="mt-4 text-sm font-medium text-steel-300">{label}</p>
        )}
        {count > 1 && (
          <p className="mt-2 text-xs tracking-widest text-steel-500">
            {index + 1} / {count}
          </p>
        )}
      </div>

      {/* Next */}
      {count > 1 && (
        <button
          type="button"
          aria-label="Image suivante"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className={cn(
            "absolute end-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 sm:end-6 sm:h-14 sm:w-14"
          )}
        >
          <ArrowRightIcon className="h-6 w-6 rtl:rotate-180" />
        </button>
      )}
    </div>
  );
}
