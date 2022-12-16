import { QueryCache, QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./stores";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: () => {
      useAuthStore.setState({ userId: undefined });
    },
  }),
});

export default queryClient;
