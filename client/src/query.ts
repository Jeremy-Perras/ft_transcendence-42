import { QueryCache, QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./stores";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: () => {
      useAuthStore.setState({ isLoggedIn: false });
    },
  }),
});

export default queryClient;
