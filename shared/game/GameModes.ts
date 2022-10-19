import { z } from "zod";
import { GameModeSchema } from "main";

export const GameModes: z.infer<typeof GameModeSchema>[] = [
  {
    name: "classic",
    description: "Click to play classic mode",
    textColor: "white",
    animation: {},
    selectedAnimation: {},
  },
  {
    name: "speed",
    description: "Click to play in speed mode",
    textColor: "red-500",
    animation: {},
    selectedAnimation: {},
  },
  {
    name: "bonus",
    description: "Click to play in bonus mode",
    textColor: "amber-500",
    animation: {
      scale: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
    selectedAnimation: {
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 1,
        delay: 0.1,
        repeat: Infinity,
      },
    },
  },
];
