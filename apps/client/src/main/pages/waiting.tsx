import { useEffect, useState } from "react";

let intervalId = -1;
export default function Waiting() {
  const [width, setWidth] = useState(0);
  const [widthString, setWidthString] = useState("0");
  useEffect(() => {
    if (intervalId == -1) {
      intervalId = setInterval(() => {
        setWidth((width) => {
          if (width == 3) return 0;
          else return width + 1;
        });
      }, 1000);
      return () => {
        clearInterval(intervalId);
        intervalId = -1;
      };
    }
  }, []);
  useEffect(() => {
    switch (width) {
      case 0:
        setWidthString("w-1/5 lg:w-[10%] xl:w-[8%]");
        break;
      case 1:
        setWidthString("w-2/5 lg:w-[20%] xl:w-[16%]");
        break;
      case 2:
        setWidthString("w-3/5 lg:w-[30%] xl:w-[24%]");
        break;
      case 3:
        setWidthString("w-4/5 lg:w-[40%] xl:w-[32%]");
        break;
    }
  }, [width]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div
        className="relative mb-4 inline-block animate-pulse  select-none text-4xl text-white"
        style={{ textShadow: "none" }}
      >
        Waiting For An Opponent
        <span className="absolute">{[...Array(width)].map(() => ".")}</span>
      </div>
    </div>
  );
}
