import * as React from "react";
import { BarChart3, TrendingUp, DollarSign, PieChart, Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics & Financial Reports"
        description="Comprehensive spend breakdown, departmental velocity, and anomaly diagnostics."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Analytics" }]}
        actions={
          <Button variant="outline" size="sm">
            Download PDF Report
          </Button>
        }
      />

      {/* Financial Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Quarterly Run Rate"
          value="$385,000.00"
          change="+8.2%"
          trend="up"
          subtitle="On track with Q3 forecast"
          icon={TrendingUp}
        />
        <MetricCard
          title="Average Cost per Employee"
          value="$1,420.00"
          change="-2.1%"
          trend="down"
          subtitle="120 active team members"
          icon={DollarSign}
        />
        <MetricCard
          title="Top Category"
          value="Cloud Infrastructure"
          change="34% share"
          trend="neutral"
          subtitle="AWS, GCP & SaaS subscriptions"
          icon={PieChart}
        />
        <MetricCard
          title="Out-of-Policy Flagged"
          value="$450.00"
          change="-45%"
          trend="down"
          subtitle="2 minor per-diem exceptions"
          icon={Layers}
        />
      </div>

      {/* Chart Visual Placeholders (Recharts Ready) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spend Trajectory (Monthly)</CardTitle>
            <CardDescription>
              Historical trends vs. budget allocations. (Chart rendering ready)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <EmptyState
              icon={BarChart3}
              title="Chart Visualization Placeholder"
              description="Recharts dependency is installed. Data series feeds will render interactive area/bar charts in future milestone."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>
              Departmental breakdown across travel, software, and hardware.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <EmptyState
              icon={PieChart}
              title="Distribution Visual Placeholder"
              description="Category breakdown pie chart placeholder. Ready for TanStack Query API endpoint binding."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
