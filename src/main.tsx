import React, { Fragment, useState } from "react";
import ReactDOM from "react-dom/client";
import { Transition } from "@headlessui/react";
import { useMediaQuery } from "@react-hookz/web/esm";
import Icon from "@mdi/react";
import { mdiAccountGroup, mdiClose } from "@mdi/js";
import * as Dialog from "@radix-ui/react-dialog";
import "./index.css";

function SocialBar() {
  return <div className="basis-128 flex flex-col bg-stone-50"></div>;
}

function SocialModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Transition
        as={Fragment}
        show={open}
        enter=" transition-translate ease-in-out duration-200"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave=" transition-translate ease-in-out duration-200"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <Dialog.Content
          forceMount
          className="w-128 absolute right-0 flex h-full flex-col bg-slate-50"
        >
          <Dialog.Close className="mx-4 my-2 self-end">
            <Icon path={mdiClose} size={1} className="text-slate-400" />
          </Dialog.Close>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>
            Make changes to your profile here. Click save when youre done.
          </Dialog.Description>
        </Dialog.Content>
      </Transition>
    </Dialog.Root>
  );
}

type GameMode = {
  name: string;
};

function CardList({
  open,
  setOpen,
  overlay,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  overlay: HTMLDivElement | null | undefined;
}) {
  const gameModes: GameMode[] = [
    {
      name: "Pong Classic",
    },
  ];

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal container={overlay}>
          <Dialog.Overlay className="z-20 h-full w-full backdrop-blur" />
          <Dialog.Content>
            {/* {gameModes.map((gameMode) => (
              <Card key={gameMode.name} gameMode={gameMode} />
            ))} */}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function Card({ gameMode }: { gameMode: GameMode }) {
  return <div>{gameMode.name}</div>;
}

function Game({ sideBar, setSideBar, smallScreen }) {
  const [open, setOpen] = useState(false);
  const [overlay, setOverlay] = React.useState<HTMLDivElement | null>();

  return (
    <div
      className="relative flex w-full grow basis-auto items-center justify-center bg-cover bg-center bg-no-repeat"
      ref={setOverlay}
      style={{ backgroundImage: "url(pong.webp)" }}
    >
      {open ? (
        <>
          {overlay && (
            <CardList open={open} setOpen={setOpen} overlay={overlay} />
          )}
        </>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="font-cursive animate-pulse select-none text-5xl font-bold tracking-widest text-stone-700 hover:animate-none"
        >
          Click To Play
        </button>
      )}

      {!sideBar && !smallScreen && (
        <button
          onClick={() => setSideBar(!sideBar)}
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
  const [open, setOpen] = useState(false);
  const smallScreen = useMediaQuery("(min-width: 1536px)");

  return (
    <div className="relative flex h-full overflow-hidden bg-black text-slate-50">
      <Game sideBar={open} setSideBar={setOpen} smallScreen={smallScreen} />
      {smallScreen ? (
        <SocialBar />
      ) : (
        <SocialModal open={open} setOpen={setOpen} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
