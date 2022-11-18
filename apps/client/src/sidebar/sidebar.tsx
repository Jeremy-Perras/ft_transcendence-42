import { useEffect } from "react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useMediaQuery } from "@react-hookz/web";
import { SidebarLayout } from "./layout";
import { motion, useAnimationControls } from "framer-motion";
import { ReactComponent as BackBurgerIcon } from "pixelarticons/svg/backburger.svg";
import * as Dialog from "@radix-ui/react-dialog";
import Home, { home } from "./pages/home";
import ChannelSettings, { channelSet } from "./pages/channelSettings";
import Channel, { channel } from "./pages/channel";
import Chat, { chat } from "./pages/chat";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../query";
import { ErrorBoundary } from "react-error-boundary";
import { useSidebarStore } from "../stores";
import Profile, { profile } from "./pages/profile";

const router = createMemoryRouter([
  {
    element: <SidebarLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
        loader: home(queryClient),
      },
      {
        path: "/channel/:channelId",
        element: <Channel />,
        loader: channel(queryClient),
      },
      {
        path: "/settings/channel/:channelId",
        element: <ChannelSettings />,
        loader: channelSet(queryClient),
      },
      {
        path: "/chat/:userId",
        element: <Chat />,
        loader: chat(queryClient),
      },
      {
        path: "/profile/:userId",
        element: <Profile />,
        loader: profile(queryClient),
      },
    ],
  },
]);

export default function SideBar() {
  const sidebarIsOpen = useSidebarStore((state) => state.isOpen);
  const closeSidebar = useSidebarStore((state) => state.close);
  const openSidebar = useSidebarStore((state) => state.open);

  const newMessage = false; // use react query to get this

  const isSmallScreen = useMediaQuery("(max-width: 1536px)");
  const controls = useAnimationControls();

  useEffect(() => {
    if (typeof isSmallScreen !== "undefined") {
      switch (isSmallScreen) {
        case true:
          closeSidebar();
          break;
        case false:
          openSidebar();
          break;
      }
    }
  }, [isSmallScreen]);

  useEffect(() => {
    const transition = {
      duration: isSmallScreen ? 0.2 : 0,
      ease: "easeIn",
    };
    (async () => {
      switch (sidebarIsOpen) {
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
  }, [sidebarIsOpen]);

  return (
    <ErrorBoundary FallbackComponent={() => <div>error</div>}>
      <QueryClientProvider client={queryClient}>
        <div className="z-10 shrink-0 font-content">
          {!sidebarIsOpen && isSmallScreen ? (
            <button
              onClick={() =>
                setTimeout(() => {
                  openSidebar();
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
          <Dialog.Root open={sidebarIsOpen} modal={false}>
            <Dialog.Content
              forceMount
              asChild
              onEscapeKeyDown={(e) => {
                e.preventDefault();
                if (isSmallScreen) {
                  closeSidebar();
                }
              }}
              onInteractOutside={(e) => {
                e.preventDefault();
                if (isSmallScreen) {
                  closeSidebar();
                }
              }}
              className={`invisible absolute right-0 flex h-screen w-full flex-col bg-slate-50  sm:w-128 2xl:relative ${
                isSmallScreen ? "shadow-2xl shadow-black" : null
              }`}
            >
              <motion.div animate={controls}>
                <RouterProvider router={router} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Root>
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
