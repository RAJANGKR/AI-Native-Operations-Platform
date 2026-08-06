import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BreadcrumbItem } from "@/types";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 pb-6 border-b border-slate-200/80 mb-6", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-slate-900 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-700">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
