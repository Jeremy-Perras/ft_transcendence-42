import React, { useEffect } from "react";
import LogoImage from "../../assets/images/title.svg";

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
let intervalId = -1;
export default function Waiting() {
  const [width, setWidth] = React.useState(0);
  const [widthString, setWidthString] = React.useState("0");
  React.useEffect(() => {
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
    <div className="relative flex h-full w-full flex-col items-center bg-black">
      <img
        src={LogoImage}
        className="mt-5 w-full max-w-sm sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl"
      />
      <div className="relative flex h-full w-full  place-content-center items-center bg-black ">
        <div className="flex h-1/4 w-3/4 flex-col  items-center justify-center  font-cursive text-xl text-white sm:text-4xl">
          <div className={`relative h-1/4 ${widthString}   bg-white`}>
            <AngleSide widthString={widthString} top="top-0" side="left-0" />
            <AngleSide widthString={widthString} top="top-0" side="right-0" />
            <AngleSide widthString={widthString} top="bottom-0" side="left-0" />
            <AngleSide
              widthString={widthString}
              top="bottom-0"
              side="right-0"
            />
          </div>
          Waiting ...
        </div>
      </div>
    </div>
  );
}
