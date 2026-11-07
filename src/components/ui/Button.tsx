import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "outline" | "solid" | "gold" | "ghost";
const styles: Record<Variant, string> = {
  outline: "border border-teal text-teal hover:bg-teal/5",
  solid: "border border-teal bg-teal text-white hover:bg-[#0c2d2f]",
  gold: "border border-gold bg-gold text-teal hover:brightness-105",
  ghost: "text-teal hover:bg-teal/5",
};

export function buttonClass(variant: Variant = "outline", size: "sm" | "md" = "md") {
  return clsx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" ? "px-3 py-1.5 text-[13px]" : "px-4 py-2.5 text-sm",
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
