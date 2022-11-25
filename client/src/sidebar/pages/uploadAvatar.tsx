import { focusManager } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useUserProfileQuery } from "../../graphql/generated";
import queryClient from "../../query";
import { ReactComponent as CloseIcon } from "pixelarticons/svg/close.svg";

export default function FileUploadPage({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [selectedFile, setSelectedFile] = useState();

  useEffect(() => {
    focusManager.setFocused(false);
    return () => focusManager.setFocused(undefined);
  }, []);

  //TODO : remove any
  //TODO : BROKEN => set the path ?
  const changeHandler = (event: any) => {
    setSelectedFile(event);
  };

  return (
    <div className={"absolute z-20 flex h-full w-full flex-col"}>
      <div className="flex h-36 w-full text-base ">
        <div
          className=" basis-1/5 bg-black bg-opacity-40"
          onClick={() => setIsOpen(false)}
        />

        <div className="relative flex w-full grow items-center justify-evenly text-clip border bg-slate-50 p-4 shadow-md shadow-slate-800">
          <CloseIcon
            className="absolute right-0 top-0 h-4 w-4 hover:cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          <input
            type="file"
            onChange={(e) => {
              if (e.currentTarget?.files) {
                if (e.currentTarget?.files[0]) {
                  changeHandler(e.currentTarget.files[0]);
                }
              } else null;
            }}
          />
          <button
            onClick={() => {
              if (selectedFile != null) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                fetch("/file/upload", {
                  method: "POST",
                  body: formData,
                }).then(() => {
                  queryClient.invalidateQueries(useUserProfileQuery.getKey());
                });
              }
              setIsOpen(false);
            }}
            className="flex shrink-0 rounded-sm border border-neutral-500 bg-neutral-100 py-1 px-2 hover:bg-slate-200"
          >
            Submit
            {/* //TODO : don't close when submit if file empty */}
          </button>
        </div>
        <div
          className="  basis-1/5 bg-black bg-opacity-40"
          onClick={() => setIsOpen(false)}
        />
      </div>
      <div
        className="flex h-full w-full bg-black bg-opacity-40"
        onClick={() => setIsOpen(false)}
      />
    </div>
  );
}
