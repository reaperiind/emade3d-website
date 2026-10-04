"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import {
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
} from "./icons";

export interface DateTimePickerProps {
  value: string; // ISO string
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const DAYS_FR = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function DateTimePicker({
  value,
  onChange,
  label = "Date et heure",
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"date" | "time">("date");
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    value ? new Date(value) : new Date()
  );
  const [hours, setHours] = useState(() =>
    value ? new Date(value).getHours() : new Date().getHours()
  );
  const [minutes, setMinutes] = useState(() =>
    value ? new Date(value).getMinutes() : 0
  );
  const ref = useRef<HTMLDivElement>(null);
  const locale = document.documentElement.lang === "ar" ? "ar" : "fr";

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setHours(d.getHours());
        setMinutes(d.getMinutes());
      }
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const day = selectedDate.getDate();
  const isRtl = locale === "ar";

  const MONTHS = isRtl ? MONTHS_AR : MONTHS_FR;
  const DAYS = isRtl ? DAYS_AR : DAYS_FR;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const formatDate = (d: Date, h: number, m: number) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}`;
  };

  const handleDayClick = (dayNum: number, monthOffset: number) => {
    const newDate = new Date(year, month + monthOffset, dayNum);
    setSelectedDate(newDate);
    setView("time");
  };

  const incrementHour = () => setHours((h) => (h + 1) % 24);
  const decrementHour = () => setHours((h) => (h - 1 + 24) % 24);
  const incrementMinute = () => setMinutes((m) => (m + 1) % 60);
  const decrementMinute = () => setMinutes((m) => (m - 1 + 60) % 60);

  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");

  const currentDateTime = formatDate(selectedDate, hours, minutes);

  return (
    <div className={cn("relative", className)} ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-dzb-navy placeholder:text-dzb-faint/70",
          "rounded-lg border border-dzb-creamline bg-white transition-colors",
          "focus:border-dzb-amber focus:outline-none focus:ring-2 focus:ring-dzb-amber/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CalendarIcon className="h-4 w-4 text-dzb-muted shrink-0" />
        <span className="flex-1 text-left">
          {value
            ? new Date(value).toLocaleString(locale === "ar" ? "ar-DZ" : "fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : label}
        </span>
        <ClockIcon className="h-4 w-4 text-dzb-muted shrink-0" />
        {isOpen ? (
          <ChevronUpIcon className="h-4 w-4 text-dzb-muted shrink-0" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-dzb-muted shrink-0" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-full max-w-xs rounded-xl border border-dzb-creamline bg-white shadow-lg overflow-hidden"
          style={{ zIndex: 50 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-dzb-creamline">
            <button
              type="button"
              onClick={() => setView("date")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition",
                view === "date"
                  ? "bg-dzb-amber text-white"
                  : "text-dzb-muted hover:bg-dzb-cream"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>{locale === "ar" ? "التاريخ" : "Date"}</span>
            </button>
            <button
              type="button"
              onClick={() => setView("time")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition",
                view === "time"
                  ? "bg-dzb-amber text-white"
                  : "text-dzb-muted hover:bg-dzb-cream"
              )}
            >
              <ClockIcon className="h-4 w-4" />
              <span>{locale === "ar" ? "الوقت" : "Heure"}</span>
            </button>
          </div>

          {/* Date View */}
          {view === "date" && (
            <div className="p-3">
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(new Date(year, month - 1, 1))
                  }
                  className="p-1.5 rounded-lg text-dzb-muted hover:bg-dzb-cream hover:text-dzb-navy"
                  aria-label={locale === "ar" ? "الشهر السابق" : "Mois précédent"}
                >
                  {isRtl ? (
                    <ChevronDownIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>
                <span className="font-medium text-dzb-navy capitalize">
                  {MONTHS[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(new Date(year, month + 1, 1))
                  }
                  className="p-1.5 rounded-lg text-dzb-muted hover:bg-dzb-cream hover:text-dzb-navy"
                  aria-label={locale === "ar" ? "الشهر التالي" : "Mois suivant"}
                >
                  {isRtl ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronUpIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs text-dzb-muted py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Previous month days */}
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <button
                    key={`prev-${i}`}
                    type="button"
                    onClick={() =>
                      handleDayClick(daysInPrevMonth - firstDayOfMonth + 1 + i, -1)
                    }
                    className="h-9 w-full text-sm text-dzb-faint hover:bg-dzb-cream hover:text-dzb-navy rounded-lg transition"
                  >
                    {daysInPrevMonth - firstDayOfMonth + 1 + i}
                  </button>
                ))}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const dayNum = i + 1;
                  const isToday =
                    dayNum === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();
                  const isSelected = dayNum === day;
                  return (
                    <button
                      key={`curr-${dayNum}`}
                      type="button"
                      onClick={() => handleDayClick(dayNum, 0)}
                      className={cn(
                        "h-9 w-full text-sm rounded-lg transition",
                        isSelected
                          ? "bg-dzb-amber text-white"
                          : "text-dzb-navy hover:bg-dzb-cream",
                        isToday && "font-bold ring-2 ring-dzb-amber"
                      )}
                    >
                      {dayNum}
                    </button>
                  );
                })}

                {/* Next month days */}
                {Array.from(
                  { length: 42 - firstDayOfMonth - daysInMonth },
                  (_, i) => (
                    <button
                      key={`next-${i}`}
                      type="button"
                      onClick={() => handleDayClick(i + 1, 1)}
                      className="h-9 w-full text-sm text-dzb-faint hover:bg-dzb-cream hover:text-dzb-navy rounded-lg transition"
                    >
                      {i + 1}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Time View */}
          {view === "time" && (
            <div className="p-3 space-y-4">
              <div className="flex items-center justify-center gap-2">
                {/* Hours */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHours((h) => (h - 1 + 24) % 24)}
                    className="p-1.5 rounded-lg text-dzb-muted hover:bg-dzb-cream hover:text-dzb-navy"
                    aria-label={locale === "ar" ? "ساعة سابقة" : "Heure précédente"}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 15l-6-6 6-6" />
                    </svg>
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-dzb-navy">{String(hours).padStart(2, "0")}</span>
                  <button
                    type="button"
                    onClick={() => setHours((h) => (h + 1) % 24)}
                    className="p-1.5 rounded-lg text-dzb-muted hover:bg-dzb-cream hover:text-dzb-navy"
                    aria-label={locale === "ar" ? "ساعة التالية" : "Heure suivante"}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>

                <span className="text-lg font-bold text-dzb-navy">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMinutes((m) => (m - 1 + 60) % 60)}
                    className="p-1.5 rounded-lg text-dzb-muted hover:bg-dzb-cream hover:text-dzb-navy"
                    aria-label={locale === "ar" ? "دقيقة سابقة" : "Minute précédente"}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 15l-6-6 6-6" />
                    </svg>
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-dzb-navy">{String(minutes).padStart(2, "0")}</span>
                  <button
                    type="button"
                    onClick={() => setMinutes((m) => (m + 1) % 60)}
                    className="p-1.5 rounded-lg text-dzb-muted hover:bg-dzb-cream hover:text-dzb-navy"
                    aria-label={locale === "ar" ? "دقيقة التالية" : "Minute suivante"}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setHours(hours, minutes);
                    onChange(newDate.toISOString());
                    setIsOpen(false);
                  }}
                  className="px-6 py-2 rounded-lg bg-dzb-amber text-white text-sm font-medium hover:bg-dzb-amber/90 transition"
                >
                  {locale === "ar" ? "تأكيد" : "Confirmer"}
                </button>
              </div>
            </div>
          )}

          {/* Footer with clear/now buttons */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-dzb-creamline">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setSelectedDate(now);
                setHours(now.getHours());
                setMinutes(now.getMinutes());
              }}
              className="flex-1 px-3 py-2 text-sm text-dzb-muted hover:bg-dzb-cream hover:text-dzb-navy rounded-lg transition"
            >
              {locale === "ar" ? "الآن" : "Maintenant"}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="flex-1 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              {locale === "ar" ? "مسح" : "Effacer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}