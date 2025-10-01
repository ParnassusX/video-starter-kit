import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type LoadingIconProps = Parameters<typeof Loader2>[0];

export function LoadingIcon({ className, ...props }: LoadingIconProps) {
  return (
    <Loader2
      className={cn("opacity-50 animate-spin", className)}
      {...props}
    />
  );
}
