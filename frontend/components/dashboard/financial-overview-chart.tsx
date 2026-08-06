"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MONTHLY_SPEND_DATA } from "@/constants/mock-dashboard-data";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-900 px-3 py-2 text-xs text-white shadow-dropdown">
        <p className="font-semibold text-slate-300">{label} 2026</p>
        <p className="mt-1 font-bold text-white">
          Spent: ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
        {payload[1] && (
          <p className="text-[11px] text-slate-400">
            Cap: ₹{payload[1].value.toLocaleString("en-IN")}
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function FinancialOverviewChart() {
  return (
    <Card className="transition-all duration-200 hover:shadow-subtle">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>
            Monthly treasury spend trajectory vs allocated cap.
          </CardDescription>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            <span className="text-slate-600 font-medium">Actual Spend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-500 font-normal">Monthly Cap</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={MONTHLY_SPEND_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#0f172a"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#spendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
