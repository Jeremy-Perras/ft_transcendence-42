import {
  QueryClient,
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  LoaderFunctionArgs,
  Navigate,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";

import ClassicIcon from "/src/assets/images/ClassicIcon.svg";
import BonusIcon from "/src/assets/images/BonusIcon.svg";
import FireIcon from "/src/assets/images/FireIcon.svg";
import UnachievedIcon from "/achievements/Unachieved.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as AddAvatarIcon } from "pixelarticons/svg/cloud-upload.svg";
import { ReactComponent as AddFriendIcon } from "pixelarticons/svg/user-plus.svg";
import { ReactComponent as PlayIcon } from "pixelarticons/svg/gamepad.svg";
import { ReactComponent as UnfriendIcon } from "pixelarticons/svg/user-x.svg";
import { ReactComponent as AcceptIcon } from "pixelarticons/svg/check.svg";
import { ReactComponent as RefuseIcon } from "pixelarticons/svg/close.svg";
import { ReactComponent as EditIcon } from "pixelarticons/svg/edit.svg";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as LogOutIcon } from "pixelarticons/svg/logout.svg";
import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
  HeaderNavigateBack,
} from "../components/header";
import { RankIcon } from "../utils/rankIcon";
import BannedDarkIcon from "/src/assets/images/Banned_dark.svg";
import { useForm, useWatch } from "react-hook-form";
import { useAuthStore } from "../../stores";
import { IsOnline } from "../components/isOnline";
import { graphql } from "../../../src/gql";
import {
  FriendStatus,
  GameMode,
  UserProfileQuery,
} from "../../../src/gql/graphql";
import request from "graphql-request";
import queryClient from "../../../src/query";

type formData = {
  name: string;
};

const UserProfileQueryDocument = graphql(`
  query UserProfile($userId: Int!) {
    user(id: $userId) {
      id
      name
      avatar
      rank
      games {
        finishedAt
        gameMode
        players {
          player1 {
            avatar
            status
            name
            rank
            id
          }
          player2 {
            avatar
            status
            name
            rank
            id
          }
        }
        score {
          player1Score
          player2Score
        }
        startAt
      }
      blocked
      blocking
      achievements {
        name
      }
      friendStatus
      status
    }
  }
`);

const query = (
  userId: number
): UseQueryOptions<UserProfileQuery, unknown, UserProfileQuery> => {
  return {
    queryKey: ["UserProfile", userId],
    queryFn: async () =>
      request("/graphql", UserProfileQueryDocument, {
        userId: userId,
      }),
  };
};

export const profileLoader = async (
  queryClient: QueryClient,
  { params }: LoaderFunctionArgs
) => {
  if (params.userId) {
    const userId = +params.userId;
    return queryClient.fetchQuery(query(userId));
  }
};

const RefuseInvitationMutationDocument = graphql(`
  mutation RefuseInvitation($userId: Int!) {
    refuseInvitation(userId: $userId)
  }
`);

const FriendUserMutationDocument = graphql(`
  mutation FriendUser($userId: Int!) {
    friendUser(userId: $userId)
  }
`);

const UnfriendUserMutationDocument = graphql(`
  mutation UnfriendUser($userId: Int!) {
    unfriendUser(userId: $userId)
  }
`);

const BlockUserMutationDocument = graphql(`
  mutation BlockUser($userId: Int!) {
    blockUser(userId: $userId)
  }
`);

const UnblockUserMutationDocument = graphql(`
  mutation UnblockUser($userId: Int!) {
    unblockUser(userId: $userId)
  }
`);

const CancelInvitationMutationDocument = graphql(`
  mutation CancelInvitation($userId: Int!) {
    cancelInvitation(userId: $userId)
  }
`);

const UpdateUserNameMutationDocument = graphql(`
  mutation UpdateUserName($name: String!) {
    updateUserName(name: $name)
  }
`);

const Achievement = ({
  icon,
  name,
  achieved,
}: {
  icon: string;
  name: string;
  achieved: boolean;
}) => {
  const [showName, setShowName] = useState(false);
  return (
    <div>
      <img
        src={icon}
        alt={`Achievement: ${name}`}
        className={`${
          achieved ? "opacity-100" : "opacity-10"
        } mx-1 py-1 opacity-100`}
        onMouseOver={() => setShowName(true)}
        onMouseOut={() => setShowName(false)}
      />
      <div
        className={`${
          showName ? "opacity-100" : "opacity-0"
        } absolute left-0 -bottom-4 w-full text-center text-xs ${
          achieved ? "text-slate-600" : "text-slate-200"
        }`}
      >
        {name}
      </div>
    </div>
  );
};

const UserProfileHeader = ({
  data,
  currentUserId,
}: {
  data: UserProfileQuery;
  currentUserId: number | undefined;
}) => {
  const numberOfGames = data?.user.games.length;

  const victories = data?.user.games.filter((game) => {
    if (
      (game.players.player1.id === data.user.id &&
        game.score.player1Score > game.score.player2Score) ||
      (game.players.player2?.id === data.user.id &&
        game.score.player2Score > game.score.player1Score)
    )
      return true;
    else return false;
  }).length;
  const victoryRate = Math.floor((100 * victories) / numberOfGames);

  const unachievedMedals = [];
  for (let i = 0; i < 8 - data.user.achievements.length; i++) {
    unachievedMedals.push(
      <Achievement
        key={i}
        icon={UnachievedIcon}
        name={"Unachieved"}
        achieved={false}
      />
    );
  }

  const changeHandler = (event: File) => {
    const formData = new FormData();
    formData.append("file", event);
    fetch("/upload/avatar/", {
      method: "POST",
      body: formData,
    }).then(() => {
      queryClient.invalidateQueries(["UserProfile", data.user.id]);
    });
  };

  const inputFile = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex flex-col">
      <div className="flex w-full items-center">
        <div className="relative my-2 ml-3 mr-2 flex shrink-0">
          {typeof data?.user.avatar !== undefined &&
          data?.user.avatar !== "" ? (
            <img
              src={`${data?.user.avatar}`}
              alt="Player avatar"
              className="h-28 w-28 border border-black"
            />
          ) : (
            <UserIcon className="h-28 w-28 border border-black text-neutral-700" />
          )}
          <IsOnline userStatus={data.user.status} />
          {data.user.id === currentUserId ? (
            <div>
              <AddAvatarIcon
                onClick={() => {
                  inputFile.current?.click();
                }}
                className="absolute -top-2 -right-2 h-6 w-6 border border-black bg-white p-px shadow-sm shadow-black hover:cursor-pointer"
              />
              <input
                type="file"
                id="file"
                ref={inputFile}
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.currentTarget?.files) {
                    if (e.currentTarget?.files[0]) {
                      changeHandler(e.currentTarget.files[0]);
                    }
                  }
                }}
              />
            </div>
          ) : null}
        </div>
        <div className="mx-4 mt-4 flex grow flex-col self-start text-left">
          <span>Matchs played : {numberOfGames} </span>
          <span>Victories : {victories} </span>
          <span>Victory rate : {numberOfGames ? `${victoryRate} %` : "-"}</span>
        </div>
        <div className="relative flex shrink-0 basis-1/3 flex-wrap items-center justify-center pt-1">
          {data.user.achievements.map((a, key) => (
            <Achievement
              key={key}
              icon={UnachievedIcon} //TODO : get corresponding icon
              name={a.name}
              achieved={true}
            />
          ))}
          {unachievedMedals}
        </div>
      </div>
    </div>
  );
};

const GameHistory = ({
  data,
  currentUserId,
}: {
  data: UserProfileQuery;
  currentUserId: number;
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex w-full grow flex-col overflow-auto p-1 text-sm">
      <h2 className="mt-8 pb-2 text-center text-xl font-bold">MATCH HISTORY</h2>
      {data.user.games.length === 0 ? (
        <div className="flex flex-col">
          <div className="mt-20 text-center text-2xl text-slate-300">
            {`${data.user.id === currentUserId ? "You" : data.user.name} didn't
            play yet !`}
          </div>
          <PlayIcon className="text-slate-100" />
        </div>
      ) : null}
      {data?.user.games.map((game, index) => {
        const victory =
          (game.players.player1.id === data?.user.id &&
            game.score.player1Score > game.score.player2Score) ||
          (game.players.player2?.id === data?.user.id &&
            game.score.player2Score > game.score.player1Score);
        const equal =
          (game.players.player1.id === data?.user.id &&
            game.score.player1Score === game.score.player2Score) ||
          (game.players.player2?.id === data?.user.id &&
            game.score.player2Score === game.score.player1Score);
        return (
          <div
            key={index}
            className="mt-1 flex h-12 w-full items-center border border-slate-700 bg-slate-200  pl-1"
          >
            <div className="relative flex w-full">
              <img
                onClick={() => navigate(`/profile/${game.players.player1.id}`)}
                className=" h-10 w-10 border border-black object-cover hover:cursor-pointer "
                src={`${game.players.player1.avatar}`}
                alt="Player 1 avatar"
              />
              <IsOnline userStatus={game.players.player1.status} />
              <div className="ml-2 w-32 self-center truncate text-left ">
                {game.players.player1.name}
              </div>
              <div className="grow select-none self-center text-center text-lg font-bold ">
                VS
              </div>
              <div className="ml-2 w-32 self-center truncate text-left ">
                {game.players.player2?.name}
              </div>
              <div className="relative">
                <img
                  onClick={() =>
                    navigate(`/profile/${game.players.player2.id}`)
                  }
                  className="h-10 w-10 justify-end border border-black object-cover hover:cursor-pointer"
                  src={`${game.players.player2.avatar}`}
                  alt="Player 2 avatar"
                />
                <IsOnline userStatus={game.players.player2.status} />
              </div>
            </div>
            <div
              className={`${
                victory ? "bg-green-400" : equal ? "bg-slate-200" : "bg-red-400"
              } mx-1 flex h-full basis-1/6 flex-col justify-center border-x border-black text-center font-bold`}
            >
              {victory ? (
                <div>VICTORY</div>
              ) : equal ? (
                <div>DRAW</div>
              ) : (
                <div>DEFEAT</div>
              )}
              <span>
                {game.score.player1Score} - {game.score.player2Score}
              </span>
            </div>
            <div className="flex justify-center">
              <img
                className="h-8 w-10 "
                src={
                  game.gameMode === GameMode.Classic
                    ? ClassicIcon
                    : game.gameMode === GameMode.Random
                    ? BonusIcon
                    : FireIcon
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AddFriend = ({
  userId,
  pendingInvitation,
  pendingAccept,
}: {
  userId: number;
  pendingInvitation: boolean | undefined;
  pendingAccept: boolean | undefined;
}) => {
  const refuseInvitation = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", RefuseInvitationMutationDocument, {
        userId: userId,
      }),
    {
      onError: () => alert("Error : refuse invitation failed"),
      onSuccess: () => queryClient.invalidateQueries(["UserProfile"]),
    }
  );

  const cancelInvitation = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", CancelInvitationMutationDocument, {
        userId: userId,
      }),
    {
      onError: () => {
        alert("Error : cancel invitation failed");

        // useErrorStore((state) => {
        //   state.pushError("Error");
        // });
      },
      onSuccess: () => queryClient.invalidateQueries(["UserProfile", userId]),
    }
  );

  const friendUser = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", FriendUserMutationDocument, {
        userId: userId,
      }),
    {
      onError: () => alert("Error : friend user failed"),
      onSuccess: () => queryClient.invalidateQueries(["UserProfile", userId]),
    }
  );

  const blockUser = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", BlockUserMutationDocument, {
        userId: userId,
      }),
    {
      onError: () => alert("Error : block user failed"),
      onSuccess: () => queryClient.invalidateQueries(["UserProfile", userId]),
    }
  );

  return (
    <div className="flex w-full select-none">
      <div
        className="flex h-24 basis-1/2 items-center justify-center border-2 bg-slate-100 p-4 text-xl font-bold text-slate-600 transition-all hover:cursor-pointer hover:bg-slate-200"
        onClick={() => {
          // useErrorStore((state) => {
          //   state.pushError("Error");
          // });
          pendingInvitation ? "" : friendUser.mutate({ userId });
        }}
      >
        {!pendingAccept && !pendingInvitation ? (
          <AddFriendIcon className="mx-4 mb-2 w-16 self-center" />
        ) : pendingInvitation ? (
          <RefuseIcon className="w-16" />
        ) : (
          <AcceptIcon className="w-16" />
        )}
        <span
          className="flex items-center text-center text-2xl font-bold"
          onClick={() => {
            // useErrorStore((state) => {
            //   state.pushError("Error");
            // });
            pendingInvitation
              ? cancelInvitation.mutate({ userId: userId })
              : "";
          }}
        >
          {pendingInvitation
            ? "Cancel Invitation"
            : pendingAccept
            ? "Accept invitation"
            : "Add Friend"}
        </span>
      </div>
      {pendingAccept ? (
        <div
          onClick={() => {
            refuseInvitation.mutate({ userId });
          }}
          className="flex h-24 basis-1/3 items-center justify-center border-y-2 border-r-2 bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
        >
          <RefuseIcon className="w-12" />
          <span>Refuse</span>
        </div>
      ) : (
        ""
      )}
      <div
        onClick={() => {
          blockUser.mutate({ userId: userId });
        }}
        className="flex h-24 basis-1/2 items-center justify-center border-y-2 border-r-2 bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
      >
        <img className="mr-5 w-12" src={BannedDarkIcon} />
        <span>Block</span>
      </div>
    </div>
  );
};

const Unblock = ({ userId }: { userId: number }) => {
  const unblockUser = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", UnblockUserMutationDocument, {
        userId: userId,
      }),
    {
      onError: () => alert("Error : unblock user failed"),
      onSuccess: () => queryClient.invalidateQueries(["UserProfile", userId]),
    }
  );
  return (
    <div
      className="flex h-24 w-full select-none flex-col items-center justify-center border-2 border-red-500 bg-red-400 p-4 font-bold text-slate-800 transition-all hover:cursor-pointer hover:bg-red-500 "
      onClick={() => {
        unblockUser.mutate({ userId: userId });
      }}
    >
      <span className="text-2xl">You blocked this user</span>
      <span>Click to unblock</span>
    </div>
  );
};

const Disconnect = () => {
  return (
    <div
      onClick={() => {
        useAuthStore.getState().logout();
      }}
      className="flex h-24 w-full select-none items-center justify-center border-2 border-slate-300 bg-slate-200 p-4 text-xl font-bold text-slate-400 transition-all hover:cursor-pointer hover:bg-slate-300  hover:text-slate-500 "
    >
      <LogOutIcon className="m-1 h-12 rotate-180 cursor-pointer" />
      <span className="text-2xl">Logout</span>
    </div>
  );
};

const Blocked = () => {
  return (
    <div className="flex h-24 w-full select-none flex-col items-center justify-center border-2 border-red-500 bg-red-400 p-4 text-xl font-bold text-slate-800 transition-all  hover:cursor-not-allowed ">
      <span className="text-2xl">You are blocked by this user</span>
    </div>
  );
};

const FriendButtons = ({ data }: { data: UserProfileQuery }) => {
  const blockUser = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", BlockUserMutationDocument, {
        userId: userId,
      }),
    {
      onError: () => alert("Error : block user message failed"),
      onSuccess: () =>
        queryClient.invalidateQueries(["UserProfile", data.user.id]),
    }
  );

  const unfriendUser = useMutation(
    async ({ userId }: { userId: number }) =>
      request("/graphql", UnfriendUserMutationDocument, {
        userId: userId,
      }),
    {
      onError: () => alert("Error : unblock user failed"),
      onSuccess: () =>
        queryClient.invalidateQueries(["UserProfile", data.user.id]),
    }
  );

  return (
    <div className="flex h-24 select-none bg-slate-100 text-2xl font-bold text-slate-600">
      <div
        onClick={() => {
          alert("Launch game invitation"); //TODO : launch invitation
        }}
        className="flex h-24 basis-1/3 items-center justify-center border-2  bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
      >
        <PlayIcon className="mr-2 w-10 self-center" />
        <span>Play !</span>
      </div>
      <div
        onClick={() => {
          unfriendUser.mutate({ userId: data.user.id });
        }}
        className="flex h-24 basis-1/3 items-center justify-center border-y-2  bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
      >
        <UnfriendIcon className="mr-2 w-10 self-center" />
        <span>Unfriend</span>
      </div>
      <div
        onClick={() => {
          blockUser.mutate({ userId: data.user.id });
        }}
        className="flex h-24 basis-1/3 items-center justify-center border-2  bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
      >
        <img className="mr-2 w-8" src={BannedDarkIcon} />
        <span>Block</span>
      </div>
    </div>
  );
};

const DisplayUserProfile = ({ data }: { data: UserProfileQuery }) => {
  const currentUserId = useAuthStore((state) => state.userId);
  if (!currentUserId) {
    return <Navigate to={"/"} replace={true} />;
  }

  const [showNameError, setShowNameError] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setFocus,
    watch,
  } = useForm<formData>();

  const watchName = useWatch({
    control,
    name: "name",
    defaultValue: data.user.name,
  });

  const updateName = useMutation(
    async ({ name }: { name: string }) =>
      request("/graphql", UpdateUserNameMutationDocument, {
        name: name,
      }),
    {
      onError: () => setShowNameError(true),
      onSuccess: () =>
        queryClient.invalidateQueries(["UserProfile", data.user.id]),
    }
  );

  const test = fetch("/upload/avatar/2", {
    method: "GET",
  });
  console.log(test);

  const [width, setWidth] = useState(0);
  const spanEl = useRef<HTMLSpanElement | null>(null);
  const setSpan = useCallback((el: HTMLSpanElement | null) => {
    if (el) {
      spanEl.current = el;
      setWidth((w) => {
        return spanEl.current?.offsetWidth
          ? spanEl.current?.offsetWidth + 1
          : w;
      });
    }
  }, []);
  useEffect(() => {
    setWidth((w) => {
      return spanEl.current?.offsetWidth ? spanEl.current?.offsetWidth + 1 : w;
    });
  }, [setSpan, watchName]);

  return (
    <div className="flex h-full w-full flex-col ">
      <Header>
        <>
          <HeaderLeftBtn>
            <HeaderNavigateBack />
          </HeaderLeftBtn>
          <HeaderCenterContent>
            <div className="relative flex h-full items-center justify-center">
              {currentUserId === data.user.id ? (
                <>
                  <img className="mr-2 h-8" src={RankIcon(data?.user.rank)} />
                  <div className="relative flex w-fit">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                      className="relative"
                    >
                      <span
                        className="invisible absolute w-fit whitespace-pre px-2"
                        ref={setSpan}
                      >
                        {watchName}
                      </span>
                      <input
                        {...register("name", {
                          maxLength: 100,
                          required: true,
                        })}
                        onFocus={() => setShowNameError(false)}
                        autoComplete="off"
                        defaultValue={data.user.name}
                        className="peer h-8 max-w-fit self-center text-ellipsis bg-slate-50 px-2"
                        style={{ width }}
                        onBlur={
                          watch("name") !== data?.user.name
                            ? handleSubmit((param) => {
                                updateName.mutate({ name: param.name });
                              })
                            : () => null
                        }
                      />
                      {errors.name?.type === "required" ? (
                        <p className="absolute left-1 -bottom-5 w-32 border border-red-500 bg-red-50 text-xs text-red-300 before:content-['⚠']">
                          Name cannot be empty
                        </p>
                      ) : errors.name?.type === "maxLength" ? (
                        <p className="absolute left-1 -bottom-5 w-32 border border-red-500 bg-red-50 text-xs text-red-300 before:content-['⚠']">
                          Name too long
                        </p>
                      ) : showNameError ? (
                        <p className="absolute left-1 -bottom-5 w-28 border border-red-500 bg-red-50 text-xs text-red-300 before:content-['⚠']">
                          Name already used
                        </p>
                      ) : null}
                    </form>
                    <div
                      onClick={() => {
                        setFocus("name");
                      }}
                      className="top-0 right-2 flex items-center hover:cursor-pointer peer-focus:hidden"
                    >
                      <EditIcon className="mb-2 h-3 text-slate-400" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative mr-4 h-8 w-8 shrink-0 ">
                    <img
                      className="h-8 w-8 border border-black"
                      src={`${data?.user.avatar}`}
                    />
                    <IsOnline userStatus={data?.user.status} />
                    <img
                      className="absolute top-0 -right-2 h-4"
                      src={RankIcon(data?.user.rank)}
                    />
                  </div>
                  <span className="select-none truncate">
                    {data?.user.name}
                  </span>
                </>
              )}
            </div>
          </HeaderCenterContent>
        </>
      </Header>
      <UserProfileHeader data={data} currentUserId={currentUserId} />
      <GameHistory data={data} currentUserId={currentUserId} />
      {currentUserId === data.user.id ? (
        <Disconnect />
      ) : data.user.blocked ? (
        <Unblock userId={data.user.id} />
      ) : data.user.blocking ? (
        <Blocked />
      ) : data.user.friendStatus === FriendStatus.Friend ? (
        <FriendButtons data={data} />
      ) : (
        <AddFriend
          userId={data.user.id}
          pendingInvitation={
            data.user.friendStatus === FriendStatus.InvitationSent
          }
          pendingAccept={
            data.user.friendStatus === FriendStatus.InvitationReceived
          }
        />
      )}
    </div>
  );
};

export default function Profile() {
  const params = useParams();
  if (typeof params.userId === "undefined") return <div>Error</div>;
  const userId = +params.userId;
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof profileLoader>
  >;
  const { data } = useQuery({ ...query(userId), initialData });
  if (typeof data === "undefined") return <div>Error</div>;
  return <DisplayUserProfile data={data} />;
}
