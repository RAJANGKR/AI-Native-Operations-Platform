"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/services/api";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [department, setDepartment] = React.useState("Computer Engineering");
  const [year, setYear] = React.useState("Third Year");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post("/auth/register", {
        full_name: fullName,
        email,
        department,
        year,
        password,
      });

      setIsSuccess(true);
    } catch (err: any) {
      const serverDetail = err?.response?.data?.detail;
      let msg = "Registration request failed.";
      if (typeof serverDetail === "string") {
        msg = serverDetail;
      } else if (Array.isArray(serverDetail)) {
        msg = serverDetail.map((d: any) => d.msg || `${d.loc?.join(".")}: ${d.msg}`).join("; ");
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-md">
            <Sparkles className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Student Registration
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Register account for College Club Expense Management Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl border border-slate-200/80 space-y-6">
          {isSuccess ? (
            <div className="space-y-4 text-center py-4 animate-in fade-in zoom-in-95">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Registration Submitted</h3>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-left text-xs space-y-2">
                <p className="font-semibold text-slate-900">Account Status: <span className="text-amber-600 font-bold uppercase">Pending Approval</span></p>
                <p className="text-slate-600 leading-relaxed">
                  Your student registration request for <span className="font-semibold text-slate-900">{email}</span> has been submitted. A Club Treasurer must authorize your account before you can log in.
                </p>
              </div>
              <Button onClick={() => router.push("/login")} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5 mt-2">
                <span>Go to Login</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rajan Garudkar"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* College Email */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">College Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajan.garudkar24@pccoepune.org"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Department */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Computer Engineering">Computer Engg</option>
                    <option value="Information Technology">IT</option>
                    <option value="AI & Data Science">AI & DS</option>
                    <option value="Electronics & Telecom">ENTC</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>

                {/* Academic Year */}
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Academic Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="First Year">First Year (FE)</option>
                    <option value="Second Year">Second Year (SE)</option>
                    <option value="Third Year">Third Year (TE)</option>
                    <option value="Final Year">Final Year (BE)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 gap-1.5 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Submit Registration Request</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-slate-500 hover:text-slate-900 font-medium">
                  Already registered? Sign in here
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
