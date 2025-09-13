"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { HUDProvider } from "@/components/hud/hudStore";
import PerfHUD from "@/components/dev/PerfHUD";
import EventLog from "@/components/dev/EventLog";
import Devtools from "@/components/dev/Devtools";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import DataProvider from "@/providers/DataProvider";
// Install persist bootstrap (rehydration)
import "@/lib/persist/bootstrap";

export default function Providers({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme: string;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <DataProvider>
        <HUDProvider>
          {children}
          {process.env.NODE_ENV !== "production" && (
            <>
              <PerfHUD />
              <EventLog />
              <Devtools />
            </>
          )}
        </HUDProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
