import React, { createContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { useMediaQuery } from "@react-hookz/web/esm";
import Icon from "@mdi/react";
import { mdiAccountGroup, mdiClose } from "@mdi/js";
import * as Dialog from "@radix-ui/react-dialog";
import "./index.css";
import { AnimatePresence, motion } from "framer-motion";

type SideBarState = {
  sideBar: boolean;
  setSideBar: (sideBar: boolean) => void;
};
const SideBarContext = createContext<null | SideBarState>(null);

function SocialBar() {
  return <div className="flex w-128 shrink-0 flex-col bg-stone-50"></div>;
}

function SocialModal() {
  const sideBar = React.useContext(SideBarContext);

  return (
    <Dialog.Root open={sideBar?.sideBar} onOpenChange={sideBar?.setSideBar}>
      <AnimatePresence>
        {sideBar?.sideBar && (
          <Dialog.Content forceMount asChild>
            <motion.div
              className="absolute right-0 flex h-full w-128  flex-col bg-slate-50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Dialog.Close className="mx-4 my-2 self-end">
                <Icon path={mdiClose} size={1} className="text-slate-400" />
              </Dialog.Close>
              <Dialog.Title>Edit profile</Dialog.Title>
              <Dialog.Description>hello</Dialog.Description>
            </motion.div>
          </Dialog.Content>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

type GameMode = {
  name: string;
};

function CardList({ setOpen }: { setOpen: (open: boolean) => void }) {
  const ref = useRef(null);
  const gameModes: GameMode[] = [
    {
      name: "Pong Classic",
    },
    {
      name: "Pong Custom #1",
    },
    {
      name: "Pong Custom #2",
    },
  ];

  return (
    <div
      ref={ref}
      onClick={(e) => e.target === ref.current && setOpen(false)}
      className="z-20 flex h-full w-full flex-col items-center justify-center backdrop-blur  md:flex-row"
    >
      {gameModes.map((gameMode) => (
        <Card key={gameMode.name} gameMode={gameMode} />
      ))}
    </div>
  );
}

function Card({ gameMode }: { gameMode: GameMode }) {
  return (
    <div className="my-2 w-96 basis-72 bg-white md:my-0 md:mx-4 md:w-64 md:basis-auto 2xl:w-72 smh:my-4">
      {gameMode.name}
    </div>
  );
}

function Game({ smallScreen }: { smallScreen: boolean }) {
  const sideBar = React.useContext(SideBarContext);
  const [open, setOpen] = useState(true);

  return (
    <div
      className="relative flex w-full shrink grow basis-auto items-center justify-center bg-contain bg-center bg-no-repeat"
      style={{ backgroundImage: "url(pong.webp)" }}
    >
      {open ? (
        <CardList setOpen={setOpen} />
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="animate-pulse select-none font-cursive text-5xl font-bold tracking-widest text-stone-700 hover:animate-none"
        >
          Click To Play
        </button>
      )}

      {!sideBar?.sideBar && !smallScreen && (
        <button
          onClick={() => sideBar?.setSideBar(!sideBar?.sideBar)}
          className="absolute top-2 right-4 z-10 animate-[fadeIn_700ms_ease_300ms_1_normal_backwards] "
        >
          <Icon
            className="inline-flex"
            path={mdiAccountGroup}
            title="Social"
            size={1.5}
          />
          <span className="absolute top-0 right-0 -m-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
        </button>
      )}
    </div>
  );
}

function App() {
  const [sideBar, setSideBar] = useState(false);
  const smallScreen = useMediaQuery("(min-width: 1536px)");

  useEffect(() => setSideBar(false), [smallScreen]);

  return (
    <div className="relative flex h-full overflow-hidden  bg-black text-slate-50">
      <SideBarContext.Provider value={{ sideBar, setSideBar }}>
        <Game smallScreen={smallScreen ? true : false} />
        {smallScreen ? <SocialBar /> : <SocialModal />}
      </SideBarContext.Provider>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
