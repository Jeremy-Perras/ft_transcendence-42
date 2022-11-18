import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  useSearchGamesQuery,
  useUpdateGameJoiningPlayerMutation,
} from "../graphql/generated";

export const FindGame = ({ gameMode }: { gameMode: number }) => {
  const { data } = useSearchGamesQuery(
    { started: false, gameMode: gameMode },
    {
      select({ games }) {
        const res: {
          gamesId: number[];
        } = {
          gamesId: games.map((game) => game.id),
        };
        return res;
        s;
      },
    }
  );

  return data;
};

export const Game = ({ gameMode }: { gameMode: number }) => {
  const queryClient = useQueryClient();
  const gameMutation = useUpdateGameJoiningPlayerMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["updateGame"]);
    },
  });
  const gameIds = FindGame({ gameMode: gameMode });
  if (gameIds?.gamesId.length) {
    gameMutation.mutate({
      updateGameId: gameIds.gamesId[0]!,
    });
  }
  return <div>game</div>;
};
