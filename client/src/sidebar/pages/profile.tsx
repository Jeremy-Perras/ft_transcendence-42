import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { LoaderFunctionArgs, useLoaderData, useParams } from "react-router-dom";
import {
  useAddFriendMutation,
  useBlockUserMutation,
  useCancelInvitationMutation,
  UserProfileQuery,
  useUnblockUserMutation,
  useUnfriendUserMutation,
  useUserProfileQuery,
  useRefuseInvitationMutation,
} from "../../graphql/generated";

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
import { useState } from "react";

import FileUploadPage from "./uploadAvatar";
import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
  HeaderNavigateBack,
} from "../components/header";
import { RankIcon } from "../utils/rankIcon";
import BannedDarkIcon from "/src/assets/images/Banned_dark.svg";

const query = (
  userId: number
): UseQueryOptions<UserProfileQuery, unknown, UserProfileQuery> => {
  return {
    queryKey: useUserProfileQuery.getKey({ userId }),
    queryFn: useUserProfileQuery.fetcher({ userId }),
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
    <div className="">
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
        } absolute left-0 -bottom-4 w-36 text-center text-xs ${
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
  const [showChangeAvatar, setShowChangeAvatar] = useState(false);

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
  const unachievedFirstRow = [];
  for (let i = 0; i < 4 - data.user.achievements.length; i++) {
    unachievedFirstRow.push(
      <Achievement
        key={i}
        icon={UnachievedIcon}
        name={"Unachieved"}
        achieved={false}
      />
    );
  }
  const unachievedSecondRow = [];
  for (let i = 0; i < 8 - data.user.achievements.length; i++) {
    if (i >= 4) break;
    unachievedSecondRow.push(
      <Achievement
        key={i}
        icon={UnachievedIcon}
        name={"Unachieved"}
        achieved={false}
      />
    );
  }
  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center">
        <div className="relative my-2 ml-3 mr-2 flex shrink-0">
          {typeof data?.user.avatar !== undefined &&
          data?.user.avatar !== "" ? (
            <img
              src={`/uploads/avatars/${data?.user.avatar}`}
              alt="Player avatar"
              className="h-28 w-28 border border-black"
            />
          ) : (
            <UserIcon className="h-28 w-28 border border-black text-neutral-700" />
          )}
          {data.user.id === currentUserId ? (
            <AddAvatarIcon
              onClick={() => setShowChangeAvatar(!showChangeAvatar)}
              className="absolute -top-2 -right-2 h-6 w-6 border border-black bg-white p-px shadow-sm shadow-black hover:cursor-pointer"
            />
          ) : (
            <></>
          )}
        </div>
        <div className="mx-4 mt-4 flex grow flex-col self-start text-left">
          <div>Matchs played : {numberOfGames} </div>
          <div>Victories : {victories} </div>
          <div>Victory rate : {numberOfGames ? `${victoryRate} %` : "-"}</div>
        </div>
        <div className="relative mr-2 flex shrink-0 flex-col justify-end pt-1 ">
          <div className="flex">
            {data.user.achievements.slice(0, 4).map((a, key) => (
              <Achievement
                key={key}
                icon={a.icon}
                name={a.name}
                achieved={true}
              />
            ))}
            {unachievedFirstRow}
          </div>
          <div className="flex">
            {data.user.achievements.slice(4, 8).map((a, key) => (
              <Achievement
                key={key}
                icon={a.icon}
                name={a.name}
                achieved={true}
              />
            ))}
            {unachievedSecondRow}
          </div>
        </div>

        {data.user.id === currentUserId && showChangeAvatar ? (
          <FileUploadPage setIsOpen={setShowChangeAvatar} />
        ) : (
          <></>
        )}
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
  return (
    <div className="flex w-full grow flex-col overflow-auto p-1 text-sm">
      <div className="mt-8 pb-2 text-center text-xl font-bold">
        MATCH HISTORY
      </div>
      {data.user.games.length === 0 ? (
        <div className="flex flex-col">
          <div className="mt-20 text-center text-2xl text-slate-300">
            {`${data.user.id === currentUserId ? "You" : data.user.name} didn't
            play yet !`}
          </div>
          <PlayIcon className="text-slate-100" />
        </div>
      ) : (
        <></>
      )}
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
            className="mt-1 flex h-12 w-full items-center border border-slate-700 bg-slate-200 "
          >
            <div className="flex w-full ">
              <img
                className="ml-1 h-10 w-10 border border-black object-cover "
                src={`/uploads/avatars/${game.players.player1.avatar}`}
                alt="Player 1 avatar"
              />
              <div className="text-ellipsistext-left ml-2 w-32 self-center">
                {game.players.player1.name}
              </div>
              <div className="grow select-none self-center text-center text-lg font-bold ">
                VS
              </div>
              <div className="mr-2 flex w-32 justify-end self-center text-ellipsis text-right">
                {game.players.player2?.name}
              </div>
              <img
                className="h-10 w-10 justify-end border border-black object-cover"
                src={`/uploads/avatars/${game.players.player2.avatar}`}
                alt="Player 2 avatar"
              />
            </div>
            <div
              className={`${
                victory ? "bg-green-400" : equal ? "bg-slate-200" : "bg-red-400"
              } mx-1 flex h-full basis-1/6 flex-col justify-center border-x border-black text-center font-bold`}
            >
              {victory ? (
                <div>VICTORY</div>
              ) : equal ? (
                <div>EQUAL</div>
              ) : (
                <div>DEFEAT</div>
              )}
              <div>
                {game.score.player1Score} - {game.score.player2Score}
              </div>
            </div>
            <div className="flex justify-center">
              <img
                className="h-8 w-10 "
                src={
                  game.gamemode === "Classic"
                    ? ClassicIcon
                    : game.gamemode === "Random"
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
  const queryClient = useQueryClient();
  const addFriend = useAddFriendMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(useUserProfileQuery.getKey());
      queryClient.invalidateQueries(useUserProfileQuery.getKey({ userId }));
    },
  });
  const block = useBlockUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(useUserProfileQuery.getKey({ userId }));
    },
  });
  const cancelInvation = useCancelInvitationMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(useUserProfileQuery.getKey());
      queryClient.invalidateQueries(
        useUserProfileQuery.getKey({ userId: userId })
      );
    },
  });
  const refuseInvation = useRefuseInvitationMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(useUserProfileQuery.getKey());
      queryClient.invalidateQueries(
        useUserProfileQuery.getKey({ userId: userId })
      );
    },
  });
  return (
    <div className="flex w-full select-none">
      <div
        className="flex h-24 basis-1/2 items-center justify-center border-2 bg-slate-100 p-4 text-xl font-bold text-slate-600 transition-all hover:cursor-pointer hover:bg-slate-200"
        onClick={() => {
          pendingInvitation ? "" : addFriend.mutate({ userId });
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
            pendingInvitation ? cancelInvation.mutate({ userId: userId }) : "";
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
            refuseInvation.mutate({ userId });
          }}
          className="flex h-24 basis-1/3 items-center justify-center border-y-2 border-r-2 bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
        >
          <RefuseIcon className="w-12" />
          <div>Refuse</div>
        </div>
      ) : (
        ""
      )}
      <div
        onClick={() => {
          block.mutate({ userId: userId });
        }}
        className="flex h-24 basis-1/2 items-center justify-center border-y-2 border-r-2 bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
      >
        <img className="mr-5 w-12" src={BannedDarkIcon} />
        <div>Block</div>
      </div>
    </div>
  );
};

const Unblock = ({ userId }: { userId: number }) => {
  const queryClient = useQueryClient();

  const unblock = useUnblockUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(useUserProfileQuery.getKey({ userId }));
    },
  });
  return (
    <div
      className="flex h-24 w-full select-none flex-col items-center justify-center border-2 border-red-500 bg-red-400 p-4 text-xl font-bold text-slate-800 transition-all hover:cursor-pointer hover:bg-red-500 "
      onClick={() => {
        userId ? unblock.mutate({ userId: userId }) : null;
      }}
    >
      <span className="flex items-center text-center text-2xl font-bold ">
        You blocked this user
      </span>
      <span className="flex items-center text-center text-base font-bold ">
        Click to unblock
      </span>
    </div>
  );
};

const Blocked = () => {
  return (
    <div className="flex h-24 w-full select-none flex-col items-center justify-center border-2 border-red-500 bg-red-400 p-4 text-xl font-bold text-slate-800 transition-all  hover:cursor-not-allowed ">
      <span className="flex items-center text-center text-2xl font-bold ">
        You are blocked by this user
      </span>
    </div>
  );
};

const FriendButtons = ({ data }: { data: UserProfileQuery }) => {
  const queryClient = useQueryClient();

  const unfriend = useUnfriendUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(useUserProfileQuery.getKey());
      queryClient.invalidateQueries(
        useUserProfileQuery.getKey({ userId: data.user.id })
      );
    },
  });

  const block = useBlockUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(
        useUserProfileQuery.getKey({ userId: data.user.id })
      );
    },
  });

  return (
    <div className="flex h-24 select-none bg-slate-100 text-2xl font-bold text-slate-600">
      <div
        onClick={() => {
          alert("Launch game invitation"); //TODO : launch invitation
        }}
        className="flex h-24 basis-1/3 items-center justify-center border-2  bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
      >
        <PlayIcon className="mr-2 w-10 self-center" />
        <div>Play !</div>
      </div>
      <div
        onClick={() => {
          unfriend.mutate({ userId: data.user.id });
        }}
        className="flex h-24 basis-1/3 items-center justify-center border-y-2  bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
      >
        <UnfriendIcon className="mr-2 w-10 self-center" />
        <div>Unfriend</div>
      </div>
      <div
        onClick={() => {
          block.mutate({ userId: data.user.id });
        }}
        className="flex h-24 basis-1/3 items-center justify-center border-2  bg-slate-100 p-4 text-center text-2xl font-bold  text-slate-600 transition-all  hover:cursor-pointer hover:bg-slate-200"
      >
        <img className="mr-2 w-8" src={BannedDarkIcon} />
        <div>Block</div>
      </div>
    </div>
  );
};

const DisplayUserProfile = ({ data }: { data: UserProfileQuery }) => {
  const CurrentUserData = () => {
    const { data } = useUserProfileQuery();
    return data;
  };
  const currentUserData = CurrentUserData();

  if (typeof currentUserData === "undefined") return <>Error</>;

  const status = data.user.friendStatus;

  //TODO : change
  const friend = data.user.friendStatus === "FRIEND";
  const pendingAccept = data.user.friendStatus === "INVITATIONRECEIVED";
  const pendingInvitation = data.user.friendStatus === "INVITATIONSEND";

  return (
    <div className="flex h-full w-full flex-col ">
      <Header>
        <>
          <HeaderLeftBtn>
            <HeaderNavigateBack />
          </HeaderLeftBtn>
          <HeaderCenterContent>
            <div className="flex h-full items-center justify-center">
              <img className="mr-2 h-8" src={RankIcon(data?.user.rank)} />
              <div>{data?.user.name}</div>
            </div>
          </HeaderCenterContent>
        </>
      </Header>
      <UserProfileHeader data={data} currentUserId={currentUserData?.user.id} />
      <GameHistory data={data} currentUserId={currentUserData?.user.id} />
      {currentUserData?.user.id === data.user.id ? null : data.user.blocked ? (
        <Unblock userId={data.user.id} />
      ) : data.user.blocking ? (
        <Blocked />
      ) : friend ? (
        <FriendButtons data={data} />
      ) : (
        <AddFriend
          userId={data.user.id}
          pendingInvitation={pendingInvitation}
          pendingAccept={pendingAccept}
        />
      )}
    </div>
  );
};

export default function Profile() {
  const params = useParams();
  if (typeof params.userId === "undefined") return <div></div>;
  const userId = +params.userId;
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof profileLoader>
  >;
  const { data } = useQuery({ ...query(userId), initialData });
  if (typeof data === "undefined") {
    return <div>Error</div>;
  } else return <DisplayUserProfile data={data} />;
}
