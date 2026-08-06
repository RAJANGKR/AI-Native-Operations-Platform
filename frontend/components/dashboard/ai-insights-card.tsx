"use client";

import * as React from "react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AIInsightsCard() {
  return (
    <Card className="relative overflow-hidden border border-slate-200/80 bg-slate-900 text-white shadow-card transition-all duration-200 hover:shadow-elevated">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                AI Insights Engine
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                Coming Soon
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Automated Treasury Intelligence & Anomaly Detection
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Once connected to backend Python repository models, AI Insights will automatically flag per-diem policy violations, detect duplicate vendor vouchers, and forecast monthly budget burn rates in real-time.
            </p>
          </div>

          <div className="shrink-0 pt-2 sm:pt-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Preview Model Specs
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
