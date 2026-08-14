"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/provider";
import { faqItems } from "@/data/faq";
import { localized } from "@/lib/localize";
import { cn } from "@/lib/cn";
import { PlusIcon } from "@/components/ui/icons";

export function FaqAccordion() {
  const { locale } = useI18n();
  const [open, setOpen] = useState<string | null>(faqItems[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {faqItems.map((item) => {
        const isOpen = open === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "card overflow-hidden transition-colors duration-200",
              isOpen ? "border-accent/35" : "hover:border-white/20"
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start sm:px-6"
            >
              <h3
                className={cn(
                  "font-display text-base font-semibold sm:text-lg",
                  isOpen ? "text-accent-soft" : "text-white"
                )}
              >
                {localized(item.question, locale)}
              </h3>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  isOpen
                    ? "rotate-45 border-accent bg-accent-dim text-accent"
                    : "border-white/15 text-steel-300"
                )}
              >
                <PlusIcon className="h-4 w-4" />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <p className="text-muted px-5 pb-5 text-sm leading-relaxed sm:px-6 sm:text-base">
                  {localized(item.answer, locale)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}