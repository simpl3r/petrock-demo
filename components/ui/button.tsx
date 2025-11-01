"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className = "", variant = "primary", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
    const variants: Record<typeof variant, string> = {
      primary:
        "bg-amber-500 text-white shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300",
      secondary:
        "bg-zinc-800 text-white shadow-md hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500",
    } as const;
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";