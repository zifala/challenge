import { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

export function Button({ className, variant = "primary", ...props }: Props) {
  return <button className={cn("btn", variant === "primary" ? "btn-primary" : "") + (className ? " " + className : "")} {...props} />;
}


