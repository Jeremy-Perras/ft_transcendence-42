import { QueryClient, useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
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
import {
  useAuthStore,
  useGameStore,
  useInvitationStore,
  useSocketStore,
  useStateStore,
} from "../stores";
import { Game, gameLoader } from "./game";
import { Home } from "./home";

const GetStateQueryDocument = graphql(`
  query UserState {
    user {
      state {
        ... on WaitingForInviteeState {
          __typename
          invitee {
            id
            name
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
  const navigate = useNavigate();
  return (
    <div className="crt flex h-full w-full flex-col items-center justify-center text-xl">
      <div className="mb-20">Page not found</div>
      <div
        className="text-2xl hover:cursor-pointer"
        onClick={() => navigate(`/`)}
      >
        HOME
      </div>
    </div>
  );
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
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
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
  const { createInvite } = useInvitationStore();
  const { setGameId } = useGameStore();

  const isLoggedIn = !!useAuthStore().userId;
  const { data: getState } = useQuery({
    queryKey: ["Users", userId],
    queryFn: async () => request("/graphql", GetStateQueryDocument, {}),
    initialData() {
      if (!isLoggedIn) {
        return {
          user: {
            state: null,
          },
        };
      }
    },
  });

  useEffect(() => {
    if (getState && getState.user.state) {
      switch (getState.user.state.__typename) {
        case "MatchmakingState": {
          setState("MatchmakingWait");
          break;
        }
        case "PlayingState": {
          setState("Playing");
          setGameId(getState.user.state.game.id);
          break;
        }
        case "WaitingForInviteeState": {
          setState("InvitationWait");
          createInvite(
            getState.user.state.invitee.name,
            getState.user.state.invitee.id
          );
          break;
        }
        default: {
          setState("Idle");
        }
      }
    } else {
      setState("Idle");
    }
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
