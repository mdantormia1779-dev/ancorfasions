"use client";

import { ThemeProvider } from "./ThemeProvider";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { SupabaseProvider } from "./SupabaseProvider";
import { SessionProvider } from "./session-provider";
import { ToastProvider } from "./ToastProvider";

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <SupabaseProvider>
          <ReactQueryProvider>
            {children}
            <ToastProvider />
          </ReactQueryProvider>
        </SupabaseProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
