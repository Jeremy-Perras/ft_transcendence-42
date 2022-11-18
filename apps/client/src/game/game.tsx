import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { socket } from "../main";
import {
  useCreateGameMutation,
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
      },
    }
  );

  return data;
};

export const Game = ({ gameMode }: { gameMode: number }) => {
  const queryClient = useQueryClient();

  const updateGameMutation = useUpdateGameJoiningPlayerMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(["updateGame"]);
    },
  });

  const createGameMutation = useCreateGameMutation();

  const gameIds = FindGame({ gameMode: gameMode });
  if (gameIds?.gamesId.length) {
    updateGameMutation.mutate({
      updateGameId: gameIds.gamesId[0]!,
    });
  } else createGameMutation.mutate({ mode: gameMode });
  return <div>game</div>;
};
