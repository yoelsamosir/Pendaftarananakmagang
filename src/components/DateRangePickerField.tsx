"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { id as localeId } from "react-day-picker/locale";
import { format } from "date-fns";
import "react-day-picker/style.css";

export default function DateRangePickerField({
  label,
  startName,
  endName,
  required,
  minDate,
  maxDate,
}: {
  label: string;
  startName: string;
  endName: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startIso = range?.from ? format(range.from, "yyyy-MM-dd") : "";
  const endIso = range?.to ? format(range.to, "yyyy-MM-dd") : startIso;
  const displayValue = range?.from
    ? range.to && range.to.getTime() !== range.from.getTime()
      ? `${format(range.from, "d MMM yyyy", { locale: localeId })} – ${format(range.to, "d MMM yyyy", { locale: localeId })}`
      : format(range.from, "d MMMM yyyy", { locale: localeId })
    : "";

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input type="hidden" name={startName} value={startIso} />
      <input type="hidden" name={endName} value={endIso} />

      <input
        type="text"
        readOnly
        required={required}
        value={displayValue}
        placeholder="Pilih 1 tanggal atau rentang tanggal"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className="w-full cursor-pointer rounded-md border border-stone-300 bg-white px-3 py-2 pr-9 text-sm focus:border-red-600 focus:outline-none"
      />
      <span className="pointer-events-none absolute right-3 top-[38px] text-stone-400">
        📅
      </span>
      <p className="mt-1 text-xs text-stone-400">
        Klik satu tanggal untuk 1 hari, atau klik tanggal awal lalu tanggal
        akhir untuk memilih rentang, lalu tekan &ldquo;Selesai&rdquo;.
      </p>

      {open && (
        <div className="absolute z-20 mt-1 rounded-lg border border-stone-200 bg-white p-2 shadow-lg">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            disabled={
              minDate && maxDate
                ? [{ before: minDate }, { after: maxDate }]
                : minDate
                  ? { before: minDate }
                  : maxDate
                    ? { after: maxDate }
                    : undefined
            }
            locale={localeId}
            captionLayout="dropdown"
            startMonth={new Date(1970, 0)}
            endMonth={new Date(new Date().getFullYear() + 3, 11)}
            style={
              {
                "--rdp-accent-color": "#065f46",
                "--rdp-accent-background-color": "#ecfdf5",
                "--rdp-today-color": "#b45309",
              } as React.CSSProperties
            }
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={!range?.from}
            className="mt-1 w-full rounded-md bg-red-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-900 disabled:opacity-40"
          >
            Selesai
          </button>
        </div>
      )}
    </div>
  );
}
