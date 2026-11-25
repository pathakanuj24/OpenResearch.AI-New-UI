"use client";

import { forwardRef, useId, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Switch with label (".tog"). */
export function Toggle({ checked, onChange, label, className }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; className?: string;
}) {
  return (
    <label className={cn("inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-pill border border-line bg-surface pl-2 pr-3.5 font-medium", className)}>
      <Switch checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <input type="checkbox" role="switch" checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)}
      className="relative h-6 w-10 shrink-0 cursor-pointer appearance-none rounded-pill bg-line-2 transition-colors checked:bg-moss
        after:absolute after:left-[3px] after:top-[3px] after:size-[18px] after:rounded-full after:bg-surface after:shadow-1
        after:transition-transform after:duration-[400ms] after:ease-spring after:content-[''] checked:after:translate-x-4" />
  );
}

/** Segmented control with a sliding white blob under the selected item. */
export function Segmented<T extends string>({ value, onChange, options, label, size = "md", className }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[];
  label: string; size?: "md" | "lg"; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const blob = useRef<HTMLSpanElement>(null);
  // Position the blob directly (no state): measure the selected button after layout.
  useLayoutEffect(() => {
    const el = ref.current?.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(value)}"]`);
    if (el && blob.current) { blob.current.style.left = `${el.offsetLeft}px`; blob.current.style.width = `${el.offsetWidth}px`; blob.current.style.opacity = "1"; }
  }, [value, options.length]);
  return (
    <div ref={ref} role="group" aria-label={label} className={cn("relative inline-flex gap-0.5 rounded-pill bg-surface-2 p-1", className)}>
      <span ref={blob} aria-hidden className="absolute top-1 bottom-1 rounded-pill bg-surface opacity-0 shadow-1 transition-[left,width] duration-[450ms] ease-spring" />
      {options.map((o) => (
        <button key={o.value} type="button" data-value={o.value} aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={cn("relative z-[1] inline-flex items-center gap-1.5 rounded-pill px-3.5 font-semibold transition-colors [&_svg]:size-4",
            size === "md" ? "h-8 text-sm" : "h-9 text-[15px]", value === o.value ? "text-ink" : "text-ink-2 hover:text-ink")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Labelled text field (".field" / ".inp"). Errors say what to do. */
type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; help?: string; error?: string | null; inputClassName?: string; trailing?: React.ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, help, error, className, inputClassName, trailing, ...props }, ref,
) {
  const id = useId();
  return (
    <div className={cn("mb-4 flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <div className="relative">
        <input ref={ref} id={id} aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-e` : help ? `${id}-h` : undefined}
          className={cn("h-12 w-full rounded-[14px] border-[1.5px] border-line-2 bg-surface px-4 text-[15.5px] text-ink outline-none transition-[border-color,box-shadow]",
            "placeholder:text-ink-3 hover:border-ink-3 focus:border-moss focus:shadow-[0_0_0_5px_var(--moss-soft)]",
            error && "border-f-psy shadow-[0_0_0_4px_color-mix(in_srgb,var(--f-psy)_14%,transparent)]", trailing && "pr-[70px]", inputClassName)}
          {...props} />
        {trailing ? <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{trailing}</span> : null}
      </div>
      {error ? <span id={`${id}-e`} role="alert" className="text-[13px] font-medium text-f-psy">{error}</span>
        : help ? <span id={`${id}-h`} className="text-[13px] text-ink-3">{help}</span> : null}
    </div>
  );
});

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mb-4 flex items-center gap-2.5 rounded-[14px] bg-[color-mix(in_srgb,var(--f-psy)_12%,var(--surface))] px-3.5 py-3 text-sm">
      <span aria-hidden className="grid size-4 shrink-0 place-items-center rounded-full bg-f-psy text-[11px] font-bold text-surface">!</span>
      {children}
    </div>
  );
}
