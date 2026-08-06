"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CATEGORY_SPEND_DATA } from "@/constants/mock-dashboard-data";

function CategoryTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs text-white shadow-dropdown">
        <p className="font-semibold">{data.name}</p>
        <p className="text-slate-300 font-bold">{data.formattedAmount} ({data.percentage}%)</p>
      </div>
    );
  }
  return null;
}

export function CategoryChart() {
  return (
    <Card className="transition-all duration-200 hover:shadow-subtle flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          Distribution across key expense categories.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
          {/* Donut Chart */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_SPEND_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={74}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {CATEGORY_SPEND_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Professional Legend */}
          <div className="space-y-2.5">
            {CATEGORY_SPEND_DATA.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-700">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{cat.formattedAmount}</span>
                  <span className="text-[11px] text-slate-400 font-mono w-8 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
