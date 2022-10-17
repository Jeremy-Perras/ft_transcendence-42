import { Link } from "react-router-dom";
import {
  AnimationControls,
  motion,
  TargetAndTransition,
  VariantLabels,
} from "framer-motion";
import { useMediaQuery } from "@react-hookz/web";
import React, { useEffect } from "react";

import LogoImage from "../../assets/pictures/title.svg";
import Arrow from "../../assets/pictures/Arrow.svg";

// const AngleSide = ({
//   widthString,
//   side,
//   top,
// }: {
//   widthString: string;
//   top: string;
//   side: string;
// }) => {
//   return (
//     <div
//       className={`${
//         widthString == "0"
//           ? "hidden"
//           : `${top}  ${side} absolute  h-1 w-1 bg-neutral-800`
//       }`}
//     ></div>
//   );
// };

// let init = false;
// const OpenBack = ({
//   isOpen,
//   setIsOpen,
// }: {
//   isOpen: boolean;
//   setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   const [width, setWidth] = React.useState(0);
//   const [widthString, setWidthString] = React.useState("0");
//   React.useEffect(() => {
//     if (!init) {
//       init = true;
//       setInterval(() => {
//         setWidth((width) => {
//           if (width == 1) return 0;
//           else return width + 1 / 4;
//         });
//       }, 1000);
//     }
//   }, []);
//   useEffect(() => {
//     switch (width) {
//       case 0:
//         setWidthString("0");
//         break;
//       case 1 / 4:
//         setWidthString("1/4");
//         break;
//       case 1 / 2:
//         setWidthString("1/2");
//         break;
//       case 3 / 4:
//         setWidthString("3/4");
//         break;
//       case 4 / 4:
//         setWidthString("full");
//         break;
//     }
//   }, [width]);

//   return (
//     <div className="r-0 absolute  top-1/4 h-1/2 w-full">
//       <div className="relative flex h-full w-full  place-content-center items-center bg-neutral-800 ">
//         <div className="flex h-1/4 w-3/4 flex-col  items-center justify-center  font-cursive text-xl text-white sm:text-4xl">
//           <div className={`relative h-1/4 w-${widthString}   bg-white`}>
//             <AngleSide widthString={widthString} top="top-0" side="left-0" />
//             <AngleSide widthString={widthString} top="top-0" side="right-0" />
//             <AngleSide widthString={widthString} top="bottom-0" side="left-0" />
//             <AngleSide
//               widthString={widthString}
//               top="bottom-0"
//               side="right-0"
//             />
//           </div>
//           Waiting ...
//         </div>
//         <div
//           className="absolute top-0 right-0 h-10 w-10 select-none bg-red-600 text-center font-cursive text-3xl text-white"
//           onClick={() => setIsOpen((isOpen) => !isOpen)}
//         >
//           <AngleSide widthString="full" top="top-0" side="left-0" />
//           <AngleSide widthString="full" top="top-0" side="right-0" />
//           <AngleSide widthString="full" top="bottom-0" side="left-0" />
//           <AngleSide widthString="full" top="bottom-0" side="right-0" />X
//           {(init = false)}
//         </div>
//       </div>
//     </div>
//   );
// };

let intervalId = -1;
const GameMode = ({ imgs, name, textEffects, animate }: GameModeType) => {
  const [isSelected, setIsSelected] = React.useState(false);
  const [animationIndex, setanimationIndex] = React.useState(0);

  React.useEffect(() => {
    if (intervalId == -1) {
      intervalId = setInterval(() => {
        setanimationIndex((animationIndex) => {
          return animationIndex == imgs.length - 1 ? 0 : animationIndex + 1;
        });
      }, 50);
      return () => {
        clearInterval(intervalId);
        intervalId = -1;
      };
    }
  }, []);

  const isNarrow = useMediaQuery("(max-width : 640px)");
  const isSmall = useMediaQuery("(max-height : 640px)");

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 2 }}
      onMouseOver={() => setIsSelected(true)}
      onMouseOut={() => setIsSelected(false)}
    >
      {/* fusion */}
      <motion.div
        className="flex flex-col items-center"
        transition={{
          duration: 0.5,
          type: "ease",
        }}
        initial={{ opacity: 0.8 }}
        whileHover={{
          scale: [null, 1.2, 1.15],
          opacity: 1,
        }}
        whileTap={{ scale: 1.1 }}
      >
        <div className="relative flex justify-center">
          {isSelected && !isSmall && !isNarrow && (
            <motion.img
              className="absolute -top-5 left-1/2"
              src={Arrow}
              initial={{ x: "-50%" }}
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
          {!isSmall && (
            <motion.img
              src={new URL(imgs[animationIndex], import.meta.url).href}
              className="mb-0 w-1/4 sm:w-1/2"
              alt={name}
              animate={animate(isSelected)}
            />
          )}
        </div>
        <motion.div
          className={`${textEffects} mt-0 font-cursive text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl`}
        >
          {name}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

type GameModeType = {
  imgs: string[];
  name: string;
  textEffects: string;
  animate: (
    isEnter: boolean
  ) => boolean | VariantLabels | AnimationControls | TargetAndTransition;
};

//function import
export default function Game() {
  const gameModes: GameModeType[] = [
    {
      imgs: (() => {
        const modules = import.meta.glob(
          "../../assets/pictures/bouncing_ball/*.svg",
          {
            eager: true,
          }
        );
        return Object.keys(modules)
          .sort()
          .map((m) => m);
      })(),
      name: "classic",
      textEffects: "text-white",
      animate: (isEnter) => false,
    },
    {
      imgs: (() => {
        const modules = import.meta.glob(
          "../../assets/pictures/fireball/*.svg",
          {
            eager: true,
          }
        );
        return Object.keys(modules)
          .sort()
          .map((m) => m);
      })(),

      name: "fireball",
      textEffects: "text-red-500",
      animate: (isEnter) => false,
    },
    {
      imgs: (() => {
        const modules = import.meta.glob("../../assets/pictures/bonus/*.svg", {
          eager: true,
        });
        return Object.keys(modules)
          .sort()
          .map((m) => m);
      })(),

      name: "bonus",
      textEffects: "text-amber-500",
      animate: (isEnter: boolean) => {
        return isEnter
          ? {
              rotate: [0, -5, 5, 0],
              transition: {
                duration: 1,
                delay: 0.1,
                repeat: Infinity,
              },
            }
          : {
              scale: 1 + 0.1 * Math.cos(0 + (2 * Math.PI) / 3),
              rotate: 0,
            };
      },
    },
  ];
  // const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative flex h-full w-full flex-col items-center bg-black">
      <img
        src={LogoImage}
        className="mt-5 w-full max-w-sm transition-opacity sm:max-w-lg lg:max-w-xl 2xl:max-w-2xl"
      />

      <div className="flex h-full w-full flex-col justify-center sm:flex-row sm:items-center">
        {gameModes.map((gameMode) => {
          return <GameMode key={gameMode.name} {...gameMode} />;
        })}
      </div>

      <Link className="absolute top-0 left-0 text-blue-600" to="/">
        Home
      </Link>
      {/* {isOpen ? <OpenBack isOpen={isOpen} setIsOpen={setIsOpen} /> : ""} */}
    </div>
  );
}
