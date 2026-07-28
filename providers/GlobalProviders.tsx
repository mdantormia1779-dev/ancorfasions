"use client";

import { ThemeProvider } from "./ThemeProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";
import { ToastProvider } from "./ToastProvider";

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        <ReactQueryProvider>
          {children}
          <ToastProvider />
        </ReactQueryProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
