import { QueryCache, QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./stores";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
  queryCache: new QueryCache({
    onError: () => {
      useAuthStore.setState({ userId: undefined });
    },
  }),
});

export default queryClient;
