import { useEffect, useState } from "react";

const AngleSide = ({ className }: { className: string }) => {
  return <div className={`${className}`}></div>;
};

let intervalId = -1;
export default function Waiting() {
  const [width, setWidth] = useState(0);
  const [widthString, setWidthString] = useState("0");
  useEffect(() => {
    if (intervalId == -1) {
      intervalId = setInterval(() => {
        setWidth((width) => {
          if (width == 5) return 0;
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
        setWidthString("w-0");
        break;
      case 1:
        setWidthString("w-1/6");
        break;
      case 2:
        setWidthString("w-2/6");
        break;
      case 3:
        setWidthString("w-3/6");
        break;
      case 4:
        setWidthString("w-4/6");
        break;
      case 5:
        setWidthString("w-5/6");
        break;
    }
  }, [width]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center font-cursive text-xl text-white sm:text-4xl">
      <div className={`relative h-36 ${widthString}   bg-white`}>
        <AngleSide className={"absolute top-0 left-0 h-3 w-2 bg-black"} />
        <AngleSide className={"absolute top-0 right-0 h-3 w-2 bg-black"} />
        <AngleSide className={"absolute bottom-0 left-0 h-3 w-2 bg-black"} />
        <AngleSide className={"absolute bottom-0 right-0 h-3 w-2 bg-black"} />
      </div>
      <span> Waiting ...</span>
    </div>
  );
}
