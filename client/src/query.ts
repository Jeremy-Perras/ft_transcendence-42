import { QueryCache, QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./stores";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000,
      refetchOnWindowFocus: true,
      retry: true,
    },
  },
  queryCache: new QueryCache({
    onError: () => {
      useAuthStore.setState({ userId: undefined, twoFAVerified: undefined });
    },
  }),
});

export default queryClient;
