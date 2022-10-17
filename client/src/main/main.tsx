import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error404 from "./pages/error-404";
import Game from "./pages/game";
import Home from "./pages/home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error404 />,
  },
  {
    path: "/game/:gameId",
    element: <Game />,
  },
]);

export default function Main() {
  return (
    <div className="w-full shrink grow bg-black">
      {/* <div className="absolute z-10 h-full w-full backdrop-blur"></div> */}
      <RouterProvider router={router} />
    </div>
  );
}
