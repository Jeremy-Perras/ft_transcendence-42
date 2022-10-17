import React, { useEffect } from "react";

let init = false;

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
          : `${top}  ${side}  absolute h-3 w-2 bg-neutral-800`
      }`}
    ></div>
  );
};

export default function Waiting() {
  const [width, setWidth] = React.useState(0);
  const [widthString, setWidthString] = React.useState("0");
  React.useEffect(() => {
    if (!init) {
      init = true;
      setInterval(() => {
        setWidth((width) => {
          if (width == 1) return 0;
          else return width + 1 / 4;
        });
      }, 1000);
    }
  }, []);
  useEffect(() => {
    switch (width) {
      case 0:
        setWidthString("0");
        break;
      case 1 / 4:
        setWidthString("1/4");
        break;
      case 1 / 2:
        setWidthString("1/2");
        break;
      case 3 / 4:
        setWidthString("3/4");
        break;
      case 4 / 4:
        setWidthString("full");
        break;
    }
  }, [width]);

  return (
    <div className="relative flex h-full w-full  place-content-center items-center bg-neutral-800 ">
      <div className="flex h-1/4 w-3/4 flex-col  items-center justify-center  font-cursive text-xl text-white sm:text-4xl">
        <div className={`relative h-1/4 w-${widthString}   bg-white`}>
          <AngleSide widthString={widthString} top="top-0" side="left-0" />
          <AngleSide widthString={widthString} top="top-0" side="right-0" />
          <AngleSide widthString={widthString} top="bottom-0" side="left-0" />
          <AngleSide widthString={widthString} top="bottom-0" side="right-0" />
        </div>
        Waiting ...
      </div>
      {(init = false)}
    </div>
  );
}
