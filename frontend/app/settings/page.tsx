"use client";

import * as React from "react";
import { Sliders, Building, ShieldCheck, Key, User, Loader2, Save } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { id: "general", label: "General & Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building },
  { id: "policy", label: "Policy Rules", icon: ShieldCheck },
  { id: "api", label: "API Keys & Webhooks", icon: Key },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = React.useState("general");
  const [isSaving, setIsSaving] = React.useState(false);

  // General & Profile State
  const [fullName, setFullName] = React.useState(user?.full_name || "Rajan Garudkar");
  const [email, setEmail] = React.useState(user?.email || "rajan.garudkar24@pccoepune.org");

  // Organization State
  const [orgName, setOrgName] = React.useState("Apex Operations Org");
  const [currency, setCurrency] = React.useState("INR");

  // Policy State
  const [autoApprovalLimit, setAutoApprovalLimit] = React.useState("5000");
  const [requireReceiptThreshold, setRequireReceiptThreshold] = React.useState("500");

  // API State
  const [apiKey, setApiKey] = React.useState("apex_live_sk_84920481059285029");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    addToast({
      title: "Settings Saved",
      description: `Successfully updated ${SETTINGS_TABS.find((t) => t.id === activeTab)?.label} preferences.`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6 select-none">
      <PageHeader
        title="Settings"
        description="Configure organization preferences, automated approval rules, and API connections."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Settings" }]}
      />

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
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer",
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
            <form onSubmit={handleSave}>
              <CardHeader>
                <CardTitle>
                  {SETTINGS_TABS.find((t) => t.id === activeTab)?.label}
                </CardTitle>
                <CardDescription>
                  Manage parameters and configuration for {activeTab} workspace settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {activeTab === "general" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Work Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "organization" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Organization Name</label>
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Primary Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === "policy" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Auto-Approval Threshold (₹)</label>
                      <input
                        type="number"
                        value={autoApprovalLimit}
                        onChange={(e) => setAutoApprovalLimit(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700 font-sans">Mandatory Receipt Threshold (₹)</label>
                      <input
                        type="number"
                        value={requireReceiptThreshold}
                        onChange={(e) => setRequireReceiptThreshold(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "api" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Live API Key</label>
                      <input
                        type="text"
                        readOnly
                        value={apiKey}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-1.5 text-xs cursor-pointer">
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    <span>Save Settings</span>
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
