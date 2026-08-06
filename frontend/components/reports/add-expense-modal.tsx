"use client";

import * as React from "react";
import { X, Plus, CreditCard, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl z-50 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Expense</h3>
              <p className="text-xs text-slate-500">Log line item voucher for this report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* UI Form Fields Placeholder */}
        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Merchant / Vendor Name</label>
            <input
              type="text"
              placeholder="e.g. IRCTC, Domino's, Hotel Grand"
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category</label>
              <select className="h-9 w-full rounded-lg border border-slate-200 px-2 text-slate-900 focus:border-slate-400 focus:outline-none">
                <option>Travel</option>
                <option>Food</option>
                <option>Accommodation</option>
                <option>Printing</option>
                <option>Equipment</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Amount (₹)</label>
              <input
                type="text"
                placeholder="0.00"
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Transaction Date</label>
            <input
              type="date"
              defaultValue="2026-08-05"
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Upload Voucher / Receipt</label>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
              <p className="font-semibold text-slate-700">Click to upload receipt</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={onClose} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Expense Line Item
          </Button>
        </div>
      </div>
    </div>
  );
}
