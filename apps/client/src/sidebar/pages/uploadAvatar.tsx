import { focusManager } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useUserProfileQuery } from "../../graphql/generated";
import queryClient from "../../query";

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
    <div className=" flex flex-col items-center justify-center">
      <input
        type="file"
        onChange={(e) => changeHandler(e.currentTarget.files[0])}
      />
      {isFilePicked ? (
        <div>
          <p>Filename: {selectedFile.name}</p>
          <p>Filetype: {selectedFile.type}</p>
          <p>Size in bytes: {selectedFile.size}</p>
        </div>
      ) : (
        <div className="m-2 flex flex-col items-center justify-center border-4 border-black bg-red-100">
          <span className="m-1"> accepted : jpg jpeg png</span>
        </div>
      )}

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
