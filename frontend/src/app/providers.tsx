import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActiveDatasetProvider } from "@/context/ActiveDatasetContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ActiveDatasetProvider>
        {children}
      </ActiveDatasetProvider>
    </QueryClientProvider>
  );
};
