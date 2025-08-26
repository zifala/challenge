import { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Props = HTMLAttributes<HTMLDivElement> & { value: number; max?: number };

export function Progress({ value, max = 100, className, ...props }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("w-full h-3 rounded bg-gray-200 overflow-hidden", className)} {...props}>
      <div className="h-full bg-black" style={{ width: `${pct}%` }} />
    </div>
  );
}


