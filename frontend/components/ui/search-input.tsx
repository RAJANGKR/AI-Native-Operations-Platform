import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showShortcut?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, showShortcut = true, placeholder = "Search reports, events, expenses...", ...props }, ref) => {
    const hasValue = value !== undefined && value !== "";

    return (
      <div className={cn("relative flex items-center w-full max-w-sm", className)}>
        <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-14 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          {...props}
        />
        {hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-3 w-3" />
          </button>
        ) : showShortcut ? (
          <kbd className="absolute right-2.5 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-400">
            <span>⌘</span>K
          </kbd>
        ) : null}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
