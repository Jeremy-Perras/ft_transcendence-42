import { QueryClient } from "@tanstack/react-query";
import {
  createBrowserRouter,
  LoaderFunctionArgs,
  Outlet,
  redirect,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import queryClient from "../query";
import { useAuthStore, useSocketStore } from "../stores";
import { Game, gameLoader } from "./game";
import { Home } from "./home";

const ErrorPage = () => {
  return <div>404</div>;
};

const GameRoot = () => {
  const socket = useSocketStore().socket;
  const navigate = useNavigate();
  socket.on("startGame", (gameId: number) => navigate(`game/${gameId}`));
  return <Outlet />;
};
const loaderFn = (
  fn: (queryClient: QueryClient, args: LoaderFunctionArgs) => unknown
) => {
  return (args: LoaderFunctionArgs) => fn(queryClient, args);
};
const router = createBrowserRouter([
  {
    element: <GameRoot />,
    children: [
      {
        path: "/",
        element: <Home />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/game/:gameId",
        element: <Game />,
        loader: loaderFn(gameLoader),
      },
    ],
  },
]);

export const GameRouter = () => {
  return (
    <div className="relative flex shrink grow flex-col items-center bg-[#002a2a] font-display text-gray-200">
      <RouterProvider router={router} />
    </div>
  );
};
