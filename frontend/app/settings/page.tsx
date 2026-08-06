"use client";

import * as React from "react";
import { Sliders, Building, ShieldCheck, Key, User } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { id: "general", label: "General & Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building },
  { id: "policy", label: "Policy Rules", icon: ShieldCheck },
  { id: "api", label: "API Keys & Webhooks", icon: Key },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure organization preferences, automated approval rules, and API connections."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Settings" }]}
      />

      {/* Settings Tab Navigation & Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Tab Sidebar */}
        <div className="md:col-span-1 space-y-1">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left select-none",
                  isActive
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {SETTINGS_TABS.find((t) => t.id === activeTab)?.label}
              </CardTitle>
              <CardDescription>
                System configuration placeholder for {activeTab} settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                <Sliders className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-700">Settings Section Shell</p>
                <p className="mt-1 max-w-sm mx-auto">
                  UI shell structure prepared for React Hook Form + Zod schema validation in subsequent integration phase.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button size="sm">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
