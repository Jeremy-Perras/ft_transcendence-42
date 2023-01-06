import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import { useAuthStore } from "../stores";
import { Game } from "./game";
import { Home } from "./home";

const ErrorPage = () => {
  return <div>404</div>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/game/:gameId",
    element: <Game />,
    loader: () => {
      if (!useAuthStore.getState().userId) {
        return redirect("/");
      }
    },
  },
]);

export const GameRouter = () => (
  <div className=" relative flex shrink grow flex-col items-center bg-[#002a2a] font-display text-gray-200">
    <RouterProvider router={router} />
  </div>
);
