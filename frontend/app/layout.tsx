import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApexExpense | AI-Native Expense Management",
  description: "Next-generation financial operations and expense management platform.",
};

import { ToastContainer } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-slate-50/50 text-slate-900 antialiased min-h-screen`}
      >
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  );
}
