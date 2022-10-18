import { useEffect, useState } from "react";
import Title from "../../components/title";
let intervalId = -1;

const AngleSide = ({
  widthString,
  side,
  top,
}: {
  widthString: string;
  top: string;
  side: string;
}) => {
  return (
    <div
      className={`${
        widthString == "0"
          ? "hidden"
          : `${top}  ${side}  absolute h-3 w-2 bg-black`
      }`}
    ></div>
  );
};

export default function Waiting() {
  const [width, setWidth] = useState(0);
  const [widthString, setWidthString] = useState("0");
  useEffect(() => {
    if (intervalId == -1) {
      intervalId = setInterval(() => {
        setWidth((width) => {
          if (width == 4) return 0;
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
        setWidthString("w-1/4");
        break;
      case 2:
        setWidthString("w-1/2");
        break;
      case 3:
        setWidthString("w-3/4");
        break;
      case 4:
        setWidthString("w-full");
        break;
    }
  }, [width]);

  return (
    <div className="flex h-full  w-full flex-col items-center space-y-5 bg-black  sm:space-y-80">
      <Title />
      <div className="flex h-1/4 w-3/4 flex-col items-center justify-center font-cursive text-xl text-white sm:text-4xl">
        <div className={`relative h-1/4 ${widthString}   bg-white`}>
          <AngleSide widthString={widthString} top="top-0" side="left-0" />
          <AngleSide widthString={widthString} top="top-0" side="right-0" />
          <AngleSide widthString={widthString} top="bottom-0" side="left-0" />
          <AngleSide widthString={widthString} top="bottom-0" side="right-0" />
        </div>
        <span> Waiting ...</span>
      </div>
    </div>
  );
}
