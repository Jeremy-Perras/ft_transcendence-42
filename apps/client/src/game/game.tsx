import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  useSearchGamesQuery,
  useUpdateGameJoiningPlayerMutation,
} from "../graphql/generated";

export const FindGame = () => {
  const [test, setTest] = useState(false);
  const { data } = useSearchGamesQuery(
    { started: false, gameMode: 2 },
    {
      select({ games }) {
        const res: {
          gamesId: number[];
        } = {
          gamesId: games.map((game) => game.id),
        };
        return res;
      },
    }
  );
  console.log(data);
  const queryClient = useQueryClient();
  const gameMutation = useUpdateGameJoiningPlayerMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["updateGame"]);
    },
  });

  if (test == false) {
    gameMutation.mutate({ updateGameId: data?.gamesId[0] });
    setTest(true);
  }
  return;
};

export const Game = () => {
  return <div>game</div>;
};
