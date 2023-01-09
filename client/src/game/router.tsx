import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { useAuthStore, useSocketStore } from "../stores";
import { Game } from "./game";
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
        // loader: () => {
        //   if (!useAuthStore.getState().userId) {
        //     return redirect("/");
        //   }
        // },
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
