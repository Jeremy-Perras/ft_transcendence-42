import { useEffect, useState } from "react";
import { useMediaQuery } from "@react-hookz/web";
import { ReactComponent as BackBurgerIcon } from "pixelarticons/svg/backburger.svg";
import { motion, useAnimationControls } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { useSidebarStore } from "../stores";
import {
  createMemoryRouter,
  LoaderFunctionArgs,
  RouterProvider,
} from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import queryClient from "../query";
import { Home, homeLoader } from "./pages/home";
import Chat, { chatLoader } from "./pages/chat";
import Profile, { profileLoader } from "./pages/profile";
import Channel, { channelLoader } from "./pages/channel";
import ChannelSettings, {
  channelSettingsLoader,
} from "./pages/channelSettings";
import { useUserChatsAndFriendsQuery } from "../graphql/generated";

const loaderFn = (
  fn: (queryClient: QueryClient, args: LoaderFunctionArgs) => unknown
) => {
  return (args: LoaderFunctionArgs) => fn(queryClient, args);
};

const router = createMemoryRouter([
  {
    path: "/",
    element: <Home />,
    loader: loaderFn(homeLoader),
  },
  {
    path: "/channel/:channelId",
    element: <Channel />,
    loader: loaderFn(channelLoader),
  },
  {
    path: "/settings/channel/:channelId",
    element: <ChannelSettings />,
    loader: loaderFn(channelSettingsLoader),
  },
  {
    path: "/chat/:userId",
    element: <Chat />,
    loader: loaderFn(chatLoader),
  },
  {
    path: "/profile/:userId",
    element: <Profile />,
    loader: loaderFn(profileLoader),
  },
]);

const SidebarOpenBtn = () => {
  const [newMessage, setNewMessage] = useState(false); // TODO: use react query to get this
  const { data } = useUserChatsAndFriendsQuery({});
  const openSidebar = useSidebarStore((state) => state.open);

  useEffect(() => {
    data?.user.friends?.forEach((friend) => {
      friend.messages.forEach((message) => {
        if (message.author.id !== data.user.id && message.readAt === null) {
          setNewMessage(true);
        }
      });
    });
    data?.user.channels.forEach((message) => {
      message.messages.forEach((readBy) => {
        if (
          !readBy.readBy?.some((user) => user.user?.id === data.user.id) &&
          readBy.author.id !== data.user.id
        ) {
          setNewMessage(true);
        }
      });
    });
  }, [data?.user.friends && data.user.channels]);
  return (
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
  );
};

export default function SideBar() {
  const sidebarIsOpen = useSidebarStore((state) => state.isOpen);
  const closeSidebar = useSidebarStore((state) => state.close);
  const openSidebar = useSidebarStore((state) => state.open);

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
    <div className="z-10 shrink-0 font-content">
      {!sidebarIsOpen && isSmallScreen ? <SidebarOpenBtn /> : null}
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
  );
}
