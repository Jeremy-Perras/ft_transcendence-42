import { useEffect, useState } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useMediaQuery } from "@react-hookz/web";
import { SideBarContext } from "./context";
import { SidebarLayout } from "./layout";
import * as Dialog from "@radix-ui/react-dialog";
import Home from "./pages/home";
import Channel from "./pages/channel";
import Chat from "./pages/chat";
import Profile from "./pages/profile";
import { motion, useAnimationControls } from "framer-motion";
import { ReactComponent as BackBurgerIcon } from "pixelarticons/svg/backburger.svg";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { channelLoader } from "./pages/channel";

const defaultQueryFn = async ({ queryKey }: { queryKey: any }) => {
  console.log("test");
  const resp = await fetch(`http://localhost:3000/api/channels/${queryKey[0]}`);
  const data = await resp.json();
  return data;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});

const router = createMemoryRouter([
  {
    element: <SidebarLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/create-channel",
        element: <Channel />,
      },
      {
        path: "/channel/:channelId",
        element: <Channel />,
        loader: channelLoader(queryClient),
      },
      {
        path: "/chat/:userId",
        element: <Chat />,
      },
      {
        path: "/profile/:userId",
        element: <Profile />,
      },
    ],
  },
]);

export default function SideBar() {
  const isSmallScreen = useMediaQuery("(max-width: 1536px)");
  const [newMessage, setNewMessage] = useState(false);
  const [showSideBar, setShowSideBar] = useState(true); // TODO: set to false
  const controls = useAnimationControls();

  useEffect(() => {
    if (typeof isSmallScreen !== "undefined") {
      // setShowSideBar(!isSmallScreen);
    }
  }, [isSmallScreen]);

  useEffect(() => {
    const transition = {
      duration: isSmallScreen ? 0.2 : 0,
      ease: "easeIn",
    };
    (async () => {
      switch (showSideBar) {
        case true:
          await controls.set({ visibility: "visible" });
          controls.start({ x: 0, transition });
          break;
        case false:
          await controls.start({ x: "100%", transition });
          controls.set({ visibility: "hidden" });
          break;
      }
    })();
  }, [showSideBar]);

  return (
    <div className="shrink-0">
      {!showSideBar && isSmallScreen ? (
        <button
          onClick={() =>
            setTimeout(() => {
              setShowSideBar(true);
            }, 1)
          }
          className="absolute top-1 right-2 z-10"
        >
          <BackBurgerIcon className="w-8 text-slate-50 sm:w-9" />
          {newMessage ? (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 bg-red-500"></span>
            </span>
          ) : null}
        </button>
      ) : null}
      <Dialog.Root open={showSideBar} modal={false}>
        <Dialog.Content
          forceMount
          asChild
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            if (isSmallScreen) {
              setShowSideBar(false);
            }
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
            if (isSmallScreen) {
              setShowSideBar(false);
            }
          }}
          className="invisible absolute right-0 flex h-full w-full flex-col bg-slate-50 font-cursive shadow-2xl shadow-black sm:w-128 2xl:relative"
        >
          <motion.div animate={controls}>
            <SideBarContext.Provider value={setShowSideBar}>
              <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
              </QueryClientProvider>
            </SideBarContext.Provider>
          </motion.div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
