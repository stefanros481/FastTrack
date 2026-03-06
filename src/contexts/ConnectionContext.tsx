"use client";

import { createContext, useContext } from "react";
import { useConnectionStatus, type ConnectionStatus } from "@/hooks/useConnectionStatus";

const ConnectionContext = createContext<ConnectionStatus>("connecting");

export function useConnection() {
  return useContext(ConnectionContext);
}

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const status = useConnectionStatus();

  return (
    <ConnectionContext value={status}>
      {children}
    </ConnectionContext>
  );
}
