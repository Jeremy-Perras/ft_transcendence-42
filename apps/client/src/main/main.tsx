import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error404 from "./pages/error-404";
import Home from "./pages/home";
import Waiting from "./pages/waiting";
import ModeSelection from "./pages/modeSelection";
import Game from "./pages/game";
import LogoImage from "../assets/images/logo.svg";
import { useAuthStore } from "../stores";
import { useState } from "react";

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

const LoginTest = () => {
  const [userId, setUserId] = useState<number>();
  const login = useAuthStore((state) => state.login);

  return (
    <>
      <input
        type="text"
        onChange={(e) => {
          setUserId(+e.currentTarget.value);
        }}
      />
      <button
        className="text-white"
        onClick={async () => {
          await fetch("/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: userId,
            }),
          });
          login();
        }}
      >
        log
      </button>
    </>
  );
};

export default function Main() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <div className="crt shrink grow bg-black">
      {isLoggedIn ? <RouterProvider router={router} /> : <Home />}
      {/* <div className="absolute z-10 h-full w-full backdrop-blur"></div> */}
    </div>
  );
}
