import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill border font-display font-semibold " +
    "transition-[transform,box-shadow,background-color] duration-[var(--t-med)] ease-spring " +
    "hover:-translate-y-0.5 hover:shadow-2 active:scale-[.96] disabled:pointer-events-none disabled:opacity-55 " +
    "[&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        pri: "bg-moss text-moss-ink border-transparent",
        sec: "bg-surface text-ink border-line-2",
        ghost: "bg-transparent text-ink border-transparent hover:bg-surface-2 hover:shadow-none",
        sun: "bg-sun text-sun-ink border-transparent",
        danger: "bg-f-psy text-moss-ink border-transparent",
        onMoss: "bg-transparent text-moss-ink border-transparent hover:bg-moss-ink/10 hover:shadow-none",
      },
      size: { md: "h-[42px] px-[18px] text-[15px]", sm: "h-[34px] px-[14px] text-sm", lg: "h-[50px] px-6 text-base w-full", icon: "size-10 p-0" },
    },
    defaultVariants: { variant: "sec", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { asChild?: boolean; loading?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, loading, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp ref={ref} className={cn(button({ variant, size }), className)} aria-busy={loading || undefined} {...props}>
      {asChild ? children : (<>{loading ? <Loader2 className="animate-spin" aria-hidden /> : null}{children}</>)}
    </Comp>
  );
});
