"use client";

import * as React from "react";
import { Plus, CreditCard, Filter, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ExpensesPage() {
  const [loadingPreview, setLoadingPreview] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Individual itemized transaction log, card charges, and automated receipt matching."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Expenses" }]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLoadingPreview(!loadingPreview)}
            >
              {loadingPreview ? "Show Empty View" : "Simulate Loading Skeleton"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput placeholder="Filter by merchant, category, or card..." />
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Filter className="h-3.5 w-3.5" />
          Filter Categories
        </Button>
      </div>

      {/* Table Content / Loading Skeleton Preview */}
      {loadingPreview ? (
        <TableSkeleton rows={5} />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={CreditCard}
              title="No Expenses Logged"
              description="No individual transaction logs recorded yet. Expenses scanned via receipt parsing or card sync will list here."
              action={
                <Button size="sm">
                  Add Single Expense
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
