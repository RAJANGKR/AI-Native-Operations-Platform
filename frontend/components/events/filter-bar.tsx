"use client";

import * as React from "react";
import { Filter, SlidersHorizontal, RotateCcw } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedChapter: string;
  onChapterChange: (chapter: string) => void;
  onReset: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedChapter,
  onChapterChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Search Field */}
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange("")}
            placeholder="Search events by title or chapter..."
          />
        </div>

        {/* Filter Dropdown Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-slate-700">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="running">Running</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Chapter Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-slate-700">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Chapter:</span>
            <select
              value={selectedChapter}
              onChange={(e) => onChapterChange(e.target.value)}
              className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Chapters</option>
              <option value="AI Chapter">AI Chapter</option>
              <option value="Coding Club">Coding Club</option>
              <option value="Robotics Society">Robotics Society</option>
              <option value="Mechanical Guild">Mechanical Guild</option>
              <option value="Cultural Board">Cultural Board</option>
              <option value="Physics Forum">Physics Forum</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedStatus !== "all" || selectedChapter !== "all" || searchQuery !== "") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 gap-1 text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
