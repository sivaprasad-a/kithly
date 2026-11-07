import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "outline" | "solid" | "gold" | "ghost";
const styles: Record<Variant, string> = {
  outline:
    "border border-teal/25 bg-white text-teal shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_1px_2px_rgba(16,56,58,.06)] hover:border-teal/40 hover:bg-teal/5",
  solid:
    "border border-[#0c2d2f] bg-gradient-to-b from-[#1a4b4d] to-teal text-white shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_1px_1px_rgba(0,0,0,.15),0_8px_18px_-8px_rgba(10,42,44,.55)] hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_1px_1px_rgba(0,0,0,.15),0_10px_22px_-8px_rgba(10,42,44,.65)]",
  gold: "border border-[#b4890e] bg-gradient-to-b from-[#f1c75c] to-gold text-teal shadow-[inset_0_1px_0_rgba(255,255,255,.65),0_1px_1px_rgba(0,0,0,.08),0_10px_22px_-10px_rgba(218,161,18,.75)] hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.75),0_1px_1px_rgba(0,0,0,.08),0_12px_26px_-10px_rgba(218,161,18,.85)]",
  ghost: "text-teal hover:bg-teal/5",
};

export function buttonClass(variant: Variant = "outline", size: "sm" | "md" = "md") {
  return clsx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
    size === "sm" ? "px-4 py-2 text-[13px]" : "px-6 py-3 text-[15px]",
    styles[variant],
  );
}

export function Button({
  variant = "outline",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" }) {
  return <button {...props} className={clsx(buttonClass(variant, size), className)} />;
}
