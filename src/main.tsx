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

function SocialModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {!open && (
        <Dialog.Trigger className="absolute top-2 right-4  inline-flex animate-[fadeIn_700ms_ease_300ms_1_normal_backwards] ">
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
        </Dialog.Trigger>
      )}
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

function App() {
  const smallScreen = useMediaQuery("(min-width: 1536px)");

  return (
    <div className="relative flex h-full overflow-hidden bg-black text-slate-50">
      <div
        className="grow basis-auto bg-cover bg-center bg-no-repeat"
        style={{ "background-image": "url(pong.webp)" }}
      ></div>
      {smallScreen ? <SocialBar /> : <SocialModal />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
