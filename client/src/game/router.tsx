import { QueryClient, useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { useEffect } from "react";
import {
  createBrowserRouter,
  LoaderFunctionArgs,
  Outlet,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { graphql } from "../gql";
import queryClient from "../query";
import { useAuthStore, useSocketStore, useStateStore } from "../stores";
import { Game, gameLoader } from "./game";
import { Home } from "./home";

const GetStateQueryDocument = graphql(`
  query UserState($userId: Int) {
    user(id: $userId) {
      state {
        ... on WaitingForInviteeState {
          invitee {
            id
          }
          gameMode
        }
        ... on MatchmakingState {
          __typename
          gameMode
        }
        ... on PlayingState {
          __typename
          game {
            id
          }
        }
      }
    }
  }
`);

const ErrorPage = () => {
  return <div>404</div>;
};

const GameRoot = () => {
  const socket = useSocketStore().socket;
  const navigate = useNavigate();
  socket.on("gameStarting", (gameId: { gameId: number }) =>
    navigate(`game/${gameId.gameId}`)
  );
  return <Outlet />;
};

const loaderFn = (
  fn: (queryClient: QueryClient, args: LoaderFunctionArgs) => unknown
) => {
  return (args: LoaderFunctionArgs) => fn(queryClient, args);
};
const router = createBrowserRouter([
  {
    element: <GameRoot />,
    children: [
      {
        path: "/",
        element: <Home />,
        errorElement: <ErrorPage />,
      },
      {
        path: "/game/:gameId",
        element: <Game />,
        loader: loaderFn(gameLoader),
      },
    ],
  },
]);

export const GameRouter = () => {
  const socket = useSocketStore().socket;
  const userId = useAuthStore().userId;
  const setState = useStateStore().setState;

  const { data: getState } = useQuery({
    queryKey: ["Users", userId],
    queryFn: async () =>
      request("/graphql", GetStateQueryDocument, {
        userId: userId,
      }),
  });

  useEffect(() => {
    setState(getState?.user.state?.__typename);
  }, [getState]);

  useEffect(() => {
    const cb = () => {
      queryClient.invalidateQueries(["Users", userId]);
    };
    socket.on("stateChanged", cb);

    return () => {
      socket.off("stateChanged", cb);
    };
  }, [userId]);

  return (
    <div className="relative flex h-screen w-screen shrink grow flex-col items-center bg-[#002a2a] p-10 font-display text-gray-200 sm:w-[calc(theme(width.full)-theme(width.128))]">
      <RouterProvider router={router} />
    </div>
  );
};
