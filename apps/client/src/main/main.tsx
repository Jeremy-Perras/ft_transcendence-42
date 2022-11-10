import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error404 from "./pages/error-404";
import Home from "./pages/home";
import Waiting from "./pages/waiting";
import ModeSelection from "./pages/modeSelection";
import Game from "./pages/game";
import LogoImage from "../assets/images/logo.svg";
import { useAuthStore } from "../stores";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error404 />,
  },
  {
    path: "/gamehomepage",
    element: <ModeSelection />,
  },
  {
    path: "/game/:gameId",
    element: <Game />,
  },
  {
    path: "/waiting",
    element: <Waiting />,
  },
]);

export default function Main() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <div className="crt relative shrink grow bg-blue-300 font-display">
      <img
        src={LogoImage}
        className="absolute left-1/2 mt-5 w-4/5 -translate-x-1/2 transform sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl"
        alt="Pong game logo"
      />
      {isLoggedIn ? <RouterProvider router={router} /> : <Home />}
      {/* <div className="absolute z-10 h-full w-full backdrop-blur"></div> */}
    </div>
  );
}
