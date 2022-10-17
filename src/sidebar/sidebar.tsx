import { useState } from "react";
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import Discussions from "./pages/discussions";
import * as Dialog from "@radix-ui/react-dialog";
import { useMediaQuery } from "@react-hookz/web";
import Channel from "./pages/channel";
import Chat from "./pages/chat";
import Profile from "./pages/profile";
import { AnimatePresence, motion } from "framer-motion";

const AnimationLayout = () => {
  const { pathname } = useLocation();

  console.log(useNavigationType());

  return (
    <AnimatePresence>
      <motion.div
        className="h-full w-full"
        key={pathname}
        transition={{ duration: 0.2, ease: "easeIn" }}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};

const router = createMemoryRouter([
  {
    element: <AnimationLayout />,
    children: [
      {
        path: "/",
        element: <Discussions />,
      },
      {
        path: "/create-channel",
        element: <Channel />,
      },
      {
        path: "/channel/:channelId",
        element: <Channel />,
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
  const [newMessage, setNewMessage] = useState(false);
  const [showSideBar, setShowSideBar] = useState(false);
  const smallScreen = useMediaQuery("(max-width: 1536px)");

  // useEffect(() => setShowSideBar(!smallScreen), [smallScreen]);

  return (
    <div className="shrink-0">
      {!showSideBar && smallScreen ? (
        <button
          onClick={() => setShowSideBar(true)}
          className="absolute top-1 right-2 z-10 animate-[fadeIn_400ms_ease_200ms_1_normal_backwards] "
        >
          <svg
            className="h-10 w-10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {" "}
            <path
              d="M11 7h10v2H11V7zm-8 4h2V9h2v2h14v2H7v2H5v-2H3v-2zm4 4v2h2v-2H7zm0-6V7h2v2H7zm14 6H11v2h10v-2z"
              fill="currentColor"
            />{" "}
          </svg>
          {newMessage ? (
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 bg-red-500"></span>
            </span>
          ) : null}
        </button>
      ) : null}
      <Dialog.Root
        open={showSideBar}
        onOpenChange={setShowSideBar}
        modal={false}
      >
        <Dialog.Content
          forceMount
          onInteractOutside={(e) => !smallScreen && e.preventDefault()}
          onOpenAutoFocus={(e) => !smallScreen && e.preventDefault()}
          className={`absolute right-0 flex h-full w-full flex-col bg-slate-50 font-cursive sm:w-128 2xl:relative ${
            showSideBar ? "translate-x-0" : "translate-x-full"
          } ${smallScreen ? "transition-transform duration-200" : ""}`}
        >
          {/* {smallScreen ? (
            <Dialog.Close className="absolute top-1 right-2">
              <svg
                className="h-8 w-8 text-slate-800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z"
                  fill="currentColor"
                />
              </svg>
            </Dialog.Close>
          ) : null} */}
          <RouterProvider router={router} />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
