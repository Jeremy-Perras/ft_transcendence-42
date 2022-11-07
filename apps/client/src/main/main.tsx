import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error404 from "./pages/error-404";
import Home from "./pages/home";
import Waiting from "./pages/waiting";
import ModeSelection from "./pages/modeSelection";
import Game from "./pages/game";

import LogoImage from "../assets/images/logo.svg";

const LogoLayout = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="flex h-full w-full flex-col items-center bg-black">
      <img
        src={LogoImage}
        className="mt-5 w-4/5 sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl"
        alt="Pong game logo"
      />
      {children}
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error404 />,
  },
  {
    path: "/gamehomepage",
    element: (
      <LogoLayout>
        <ModeSelection />
      </LogoLayout>
    ),
  },
  {
    path: "/game/:gameId",
    element: <Game />,
  },
  {
    path: "/waiting",
    element: (
      <LogoLayout>
        <Waiting />
      </LogoLayout>
    ),
  },
]);

export default function Main() {
  return (
    <div className="shrink grow bg-black">
      {/* <div className="absolute z-10 h-full w-full backdrop-blur"></div> */}
      <RouterProvider router={router} />
    </div>
  );
}
