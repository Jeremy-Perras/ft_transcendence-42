import { focusManager } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useUserProfileQuery } from "../../graphql/generated";
import queryClient from "../../query";

import { ReactComponent as AddAvatarIcon } from "pixelarticons/svg/cloud-upload.svg";
export default function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);

  useEffect(() => {
    focusManager.setFocused(false);
    return () => focusManager.setFocused(undefined);
  }, []);

  const changeHandler = (event) => {
    setSelectedFile(event);
    setIsFilePicked(true);
  };
  return (
    <div className="flex flex-row">
      <input
        type="file"
        onChange={(e) => changeHandler(e.currentTarget.files[0])}
      />
      <button
        onClick={() => {
          const formData = new FormData();
          formData.append("file", selectedFile);
          fetch("/file/upload", {
            method: "POST",
            body: formData,
          }).then(() => {
            queryClient.invalidateQueries(useUserProfileQuery.getKey());
          });
        }}
        className="flex border-2 border-black bg-slate-100 hover:bg-slate-200"
      >
        Submit
      </button>
    </div>
  );
}
