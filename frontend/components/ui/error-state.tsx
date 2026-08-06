import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Unable to load data",
  description = "A temporary communication error occurred. Please verify network connection or retry.",
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-rose-200/60 bg-rose-50/30 p-6 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 text-xs text-slate-600 max-w-sm">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
}
