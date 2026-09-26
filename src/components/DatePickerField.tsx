"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { id as localeId } from "react-day-picker/locale";
import { format, parseISO, isValid } from "date-fns";
import "react-day-picker/style.css";

export default function DatePickerField({
  label,
  name,
  required,
  defaultValue,
  minDate,
  maxDate,
  onChange,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  minDate?: Date;
  maxDate?: Date;
  onChange?: (value: string) => void;
}) {
  const initial = defaultValue ? parseISO(defaultValue) : undefined;
  const [selected, setSelected] = useState<Date | undefined>(
    initial && isValid(initial) ? initial : undefined
  );
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

  const isoValue = selected ? format(selected, "yyyy-MM-dd") : "";
  const displayValue = selected
    ? format(selected, "d MMMM yyyy", { locale: localeId })
    : "";

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {/* Nilai sesungguhnya yang dikirim form, format yyyy-MM-dd */}
      <input type="hidden" name={name} value={isoValue} />

      {/* Input tampilan: readOnly supaya validasi "required" bawaan browser tetap jalan */}
      <input
        type="text"
        readOnly
        required={required}
        value={displayValue}
        placeholder="Pilih tanggal"
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

      {open && (
        <div className="absolute z-20 mt-1 rounded-lg border border-stone-200 bg-white p-2 shadow-lg">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              setSelected(date);
              setOpen(false);
              onChange?.(date ? format(date, "yyyy-MM-dd") : "");
            }}
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
        </div>
      )}
    </div>
  );
}
