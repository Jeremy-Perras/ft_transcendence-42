import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import React from "react";

const GameMode = ({ imgUrl, name, textEffects }: GameModeType) => {
  const [image, setImage] = React.useState(0);
  React.useEffect(() => {
    setTimeout(() => {
      image == 20 ? setImage(0) : image;
      setImage((image) => image + 1);
    }, 50);
  });

  return (
    <motion.div
      className="mb-0 flex h-1/3 w-full flex-row"
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 3 }}
    >
      <motion.div
        transition={{ duration: 0.2 }}
        initial={{ opacity: 0.9 }}
        whileHover={{ scale: [null, 1.2], opacity: 1 }}
        whileTap={{ scale: 1.1 }}
      >
        <div className="relative m-2  w-full justify-center">
          <img
            src={imgUrl}
            className="align-self-end m-auto mb-0 w-1/2"
            alt="bonus"
          />
        </div>
        <div
          className={`${textEffects} m-2 h-auto w-full text-center font-Games text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl`}
        >
          {name}
        </div>
      </motion.div>
    </motion.div>
  );
};

type GameModeType = {
  imgUrl: string;
  name: string;
  textEffects: string;
};

export default function Game() {
  const gameModes: GameModeType[] = [
    {
      imgUrl: "/pictures/bouncing_ball/bouncing_ball1.svg",
      name: "classic",
      textEffects: "text-white",
    },
    {
      imgUrl: "/pictures/fire.gif",
      name: "fireball",
      textEffects: "text-red-500",
    },
    {
      imgUrl: "/pictures/gift.png",
      name: "bonus",
      textEffects: "text-amber-500",
    },
  ];
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-black">
      <img src="/pictures/title.svg" className="mt-5  w-full "></img>
      <div className="flex h-1/3 flex-row">
        {gameModes.map((gameMode) => {
          return <GameMode key={gameMode.name} {...gameMode} />;
        })}
      </div>
      <Link className="absolute top-0 left-0 text-blue-600" to="/">
        Home
      </Link>
    </div>
  );
}
