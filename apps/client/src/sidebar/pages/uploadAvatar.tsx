import { focusManager } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useUserProfileQuery } from "../../graphql/generated";
import queryClient from "../../query";

import { ReactComponent as AddAvatarIcon } from "pixelarticons/svg/cloud-upload.svg";
export default function FileUploadPage({
  open,
  setIsOpen,
}: {
  open: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [selectedFile, setSelectedFile] = useState();

  useEffect(() => {
    focusManager.setFocused(false);
    return () => focusManager.setFocused(undefined);
  }, []);

  const changeHandler = (event) => {
    setSelectedFile(event);
  };
  return (
    <div className="absolute z-10 flex h-40 flex-col items-center justify-center  border-2 bg-white">
      <div className="flex border-2" onClick={() => setIsOpen(false)}>
        Close
      </div>
      <input
        type="file"
        onChange={(e) => {
          if (e.currentTarget.files[0]) {
            changeHandler(e.currentTarget.files[0]);
          }
        }}
      />
      <div className="flex">
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
          className=" flex h-fit border-2 border-black bg-slate-100 hover:bg-slate-200"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
