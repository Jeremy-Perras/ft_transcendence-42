import {
  LoaderFunctionArgs,
  Navigate,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";

import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as TrashIcon } from "pixelarticons/svg/trash.svg";
import { ReactComponent as MuteIcon } from "pixelarticons/svg/volume-x.svg";
import { ReactComponent as UnmuteIcon } from "pixelarticons/svg/volume.svg";
import { ReactComponent as UnbanIcon } from "pixelarticons/svg/user-plus.svg";
import { ReactComponent as AddMemberIcon } from "pixelarticons/svg/user-plus.svg";
import { ReactComponent as BanIcon } from "pixelarticons/svg/user-x.svg";
import { ReactComponent as AdminIcon } from "pixelarticons/svg/briefcase-plus.svg";
import { ReactComponent as RemoveAdminIcon } from "pixelarticons/svg/briefcase-minus.svg";
import { ReactComponent as CloseIcon } from "pixelarticons/svg/close.svg";
import { ReactComponent as SearchIcon } from "pixelarticons/svg/search.svg";
import { ReactComponent as SettingsIcon } from "pixelarticons/svg/sliders.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as LeaveIcon } from "pixelarticons/svg/logout.svg";
import { ReactComponent as ConnectionErrorIcon } from "pixelarticons/svg/downasaur.svg";

import { useRef, useState } from "react";
import * as Avatar from "@radix-ui/react-avatar";
import { useForm } from "react-hook-form";
import {
  QueryClient,
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
  HeaderNavigateBack,
} from "../components/header";
import { ChannelUserRole } from "../types/channelUserRole";
import { useAuthStore, useErrorStore } from "../../stores";
import { Empty } from "../components/Empty";
import { Highlight } from "../components/highlight";
import { ChannelUserStatus } from "../types/channelUserStatus";
import { graphql } from "../../gql";
import request from "graphql-request";
import { ChannelSettingsQuery, SearchUsersQuery } from "../../gql/graphql";
import queryClient from "../../query";

type ChannelQueryResult = Omit<ChannelSettingsQuery["channel"], "admins"> & {
  admins: ChannelSettingsQuery["channel"]["members"];
};

const SearchUsersQueryDocument = graphql(`
  query SearchUsers($name: String!) {
    users(name: $name) {
      id
      name
      avatar
      status
      channels {
        id
      }
    }
  }
`);

const ChannelSettingsQueryDocument = graphql(`
  query ChannelSettings($channelId: Int!) {
    channel(id: $channelId) {
      id
      name
      owner {
        id
        name
        avatar
      }
      admins {
        id
        name
        avatar
      }
      members {
        id
        name
        avatar
      }
      banned {
        user {
          id
          name
          avatar
        }
        endAt
      }
      muted {
        user {
          id
        }
        endAt
      }
      passwordProtected
      private
    }
  }
`);

const query = (
  channelId: number
): UseQueryOptions<ChannelSettingsQuery, unknown, ChannelQueryResult> => {
  return {
    queryKey: ["ChannelSettings", channelId], //TODO : check if this is the right key combo
    queryFn: async () =>
      request("/graphql", ChannelSettingsQueryDocument, {
        channelId: channelId,
      }),

    select: (data) => ({
      id: data.channel.id,
      name: data.channel.name,
      passwordProtected: data.channel.passwordProtected,
      private: data.channel.private,
      owner: data.channel.owner,
      admins: data.channel.members.filter((m) =>
        data.channel.admins.some((a) => a.id === m.id)
      ),
      members: data.channel.members.filter(
        (m) => !data.channel.admins.some((a) => a.id === m.id)
      ),
      banned: data.channel.banned,
      muted: data.channel.muted,
    }),
  };
};

export const channelSettingsLoader = async (
  queryClient: QueryClient,
  { params }: LoaderFunctionArgs
) => {
  if (params.channelId) {
    const channelId = +params.channelId;
    return queryClient.fetchQuery(query(channelId));
  }
};

const BanUserMutationDocument = graphql(`
  mutation BanUser(
    $channelId: Int!
    $restrictedId: Int!
    $restrictUntil: Timestamp
  ) {
    banUser(
      channelId: $channelId
      userId: $restrictedId
      restrictUntil: $restrictUntil
    )
  }
`);

const UnbanUserMutationDocument = graphql(`
  mutation UnbanUser($userId: Int!, $channelId: Int!) {
    unbanUser(userId: $userId, channelId: $channelId)
  }
`);

const MuteUserMutationDocument = graphql(`
  mutation MuteUser(
    $channelId: Int!
    $restrictedId: Int!
    $restrictUntil: Timestamp
  ) {
    muteUser(
      channelId: $channelId
      userId: $restrictedId
      restrictUntil: $restrictUntil
    )
  }
`);

const UnmuteUserMutationDocument = graphql(`
  mutation UnmuteUser($userId: Int!, $channelId: Int!) {
    unmuteUser(userId: $userId, channelId: $channelId)
  }
`);

const AddAdminMutationDocument = graphql(`
  mutation AddAdmin($userId: Int!, $channelId: Int!) {
    addAdmin(userId: $userId, channelId: $channelId)
  }
`);

const RemoveAdminMutationDocument = graphql(`
  mutation RemoveAdmin($userId: Int!, $channelId: Int!) {
    removeAdmin(userId: $userId, channelId: $channelId)
  }
`);

const InviteUserMutationDocument = graphql(`
  mutation InviteUser($userId: Int!, $channelId: Int!) {
    inviteUser(userId: $userId, channelId: $channelId)
  }
`);

const LeaveChannelMutationDocument = graphql(`
  mutation LeaveChannel($channelId: Int!) {
    leaveChannel(channelId: $channelId)
  }
`);

const DeleteChannelMutationDocument = graphql(`
  mutation DeleteChannel($channelId: Int!) {
    deleteChannel(channelId: $channelId)
  }
`);

const UpdatePasswordMutationDocument = graphql(`
  mutation UpdatePassword($password: String, $channelId: Int!) {
    updatePassword(password: $password, channelId: $channelId)
  }
`);

enum restrictionAction {
  BAN,
  MUTE,
}

type RestrictionTime = {
  text: string;
  endAt: number | null | undefined;
};

const restrictionTimeArray: RestrictionTime[] = [
  {
    text: "1h",
    endAt: Math.floor(new Date() as unknown as number) + 60 * 60 * 1000,
  },
  {
    text: "8h",
    endAt: Math.floor(new Date() as unknown as number) + 60 * 60 * 8 * 1000,
  },
  {
    text: "24h",
    endAt: Math.floor(new Date() as unknown as number) + 60 * 60 * 24 * 1000,
  },
  {
    text: "Indef.",
    endAt: null,
  },
];

const SetRestrictionTimeButton = ({
  channelId,
  userId,
  time,
  action,
  setShowTime,
}: {
  channelId: number;
  userId: number;
  time: RestrictionTime;
  action: restrictionAction;
  setShowTime: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const ban = useMutation(
    async ({
      channelId,
      restrictedId,
      restrictUntil,
    }: {
      channelId: number;
      restrictedId: number;
      restrictUntil: number | null | undefined;
    }) =>
      request("/graphql", BanUserMutationDocument, {
        restrictedId: restrictedId,
        channelId: channelId,
        restrictUntil: restrictUntil,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : ban failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelSettings", channelId]),
    }
  );
  const mute = useMutation(
    async ({
      channelId,
      restrictedId,
      restrictUntil,
    }: {
      channelId: number;
      restrictedId: number;
      restrictUntil: number | null | undefined;
    }) =>
      request("/graphql", MuteUserMutationDocument, {
        channelId: channelId,
        restrictedId: restrictedId,
        restrictUntil: restrictUntil,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : mute failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelSettings", channelId]),
    }
  );

  return (
    <div
      className="hover:bg-slate-300"
      onClick={() => {
        setShowTime(false);
        action === restrictionAction.BAN
          ? ban.mutate({
              channelId: channelId,
              restrictedId: userId,
              restrictUntil: time.endAt,
            })
          : mute.mutate({
              channelId: channelId,
              restrictedId: userId,
              restrictUntil: time.endAt,
            });
      }}
    >
      {time.text}
    </div>
  );
};

const ChooseTimeButton = ({
  userId,
  channelId,
  action,
  showTime,
  setShowTime,
}: {
  userId: number;
  channelId: number;
  action: restrictionAction;
  showTime: boolean;
  setShowTime: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div
      onMouseLeave={() => setShowTime(false)}
      className={`${
        showTime
          ? "visible h-fit w-10 border-2 opacity-100"
          : "hidden h-0 w-0 opacity-0"
      } absolute -left-1 -top-5 z-10 flex-col border-slate-300 bg-slate-200 text-center text-xs text-slate-700 transition-all`}
    >
      {restrictionTimeArray.map((restrictionTime) => {
        return (
          <SetRestrictionTimeButton
            key={restrictionTime.text}
            channelId={channelId}
            userId={userId}
            setShowTime={setShowTime}
            action={action}
            time={restrictionTime}
          />
        );
      })}
    </div>
  );
};

const ToggleMuteStatus = ({
  id,
  channelId,
  userStatus,
}: {
  id: number;
  channelId: number;
  userStatus: ChannelUserStatus;
}) => {
  const [showInfoMute, setShowInfoMute] = useState(false);
  const [showTimeMute, setShowTimeMute] = useState(false);

  const unmuteUser = useMutation(
    async ({ channelId, userId }: { channelId: number; userId: number }) =>
      request("/graphql", UnmuteUserMutationDocument, {
        channelId: channelId,
        userId: userId,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : unmute failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelSettings", channelId]),
    }
  );

  return (
    <div className="relative flex w-8 flex-col justify-end text-center transition-all hover:cursor-pointer">
      {showTimeMute && (
        <ChooseTimeButton
          action={restrictionAction.MUTE}
          channelId={channelId}
          setShowTime={setShowTimeMute}
          showTime={showTimeMute}
          userId={id}
        />
      )}
      <div className="flex flex-col items-center justify-center">
        {userStatus === ChannelUserStatus.MUTED ? (
          <UnmuteIcon
            onMouseOver={() => setShowInfoMute(true)}
            onMouseOut={() => setShowInfoMute(false)}
            className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
            onClick={() => {
              unmuteUser.mutate({
                channelId: channelId,
                userId: id,
              });
            }}
          />
        ) : (
          <MuteIcon
            onMouseOver={() => setShowInfoMute(true)}
            onMouseOut={() => setShowInfoMute(false)}
            onClick={() => {
              setShowTimeMute(true);
            }}
            className="w-6 border-2 border-slate-300 text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
          />
        )}
        <span
          className={`${
            showInfoMute ? "opacity-100" : "opacity-0 "
          } absolute top-6 w-8 text-center text-xs text-slate-400`}
        >
          {userStatus === ChannelUserStatus.MUTED ? "Unmute" : "Mute"}
        </span>
      </div>
    </div>
  );
};

const ToggleBanStatus = ({
  id,
  channelId,
  userStatus,
}: {
  id: number;
  channelId: number;
  userStatus: ChannelUserStatus;
}) => {
  const [showInfoBan, setShowInfoBan] = useState(false);
  const [showTimeBan, setShowTimeBan] = useState(false);

  const unbanUser = useMutation(
    async ({ channelId, userId }: { channelId: number; userId: number }) =>
      request("/graphql", UnbanUserMutationDocument, {
        channelId: channelId,
        userId: userId,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : unban failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelSettings", channelId]),
    }
  );
  return (
    <div className="relative flex w-8 flex-col justify-end text-center transition-all hover:cursor-pointer">
      {showTimeBan && (
        <ChooseTimeButton
          action={restrictionAction.BAN}
          channelId={channelId}
          setShowTime={setShowTimeBan}
          showTime={showTimeBan}
          userId={id}
        />
      )}
      <div className="flex flex-col items-center justify-center">
        {userStatus === ChannelUserStatus.BANNED ? (
          <UnbanIcon
            onMouseOver={() => setShowInfoBan(true)}
            onMouseOut={() => setShowInfoBan(false)}
            className="w-6 border-2 border-red-500 text-red-600 hover:cursor-pointer hover:border-red-700 hover:text-red-800"
            onClick={() => {
              unbanUser.mutate({
                channelId: channelId,
                userId: id,
              });
            }}
          />
        ) : (
          <BanIcon
            onMouseOver={() => setShowInfoBan(true)}
            onMouseOut={() => setShowInfoBan(false)}
            onClick={() => {
              setShowTimeBan(true);
            }}
            className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
          />
        )}
        <span
          className={`${showInfoBan ? "opacity-100" : "opacity-0 "} ${
            userStatus === ChannelUserStatus.BANNED
              ? "text-red-500"
              : "text-slate-400"
          } absolute top-6 w-8 text-center text-xs`}
        >
          {userStatus === ChannelUserStatus.BANNED ? "Unban" : "Ban"}
        </span>
      </div>
    </div>
  );
};

const ToggleAdminRole = ({
  id,
  channelId,
  userRole,
}: {
  id: number;
  channelId: number;
  userRole: ChannelUserRole;
}) => {
  const [showInfoAdmin, setShowInfoAdmin] = useState(false);

  const addAdmin = useMutation(
    async ({ channelId, userId }: { channelId: number; userId: number }) =>
      request("/graphql", AddAdminMutationDocument, {
        channelId: channelId,
        userId: userId,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : add admin failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelSettings", channelId]),
    }
  );

  const removeAdmin = useMutation(
    async ({ channelId, userId }: { channelId: number; userId: number }) =>
      request("/graphql", RemoveAdminMutationDocument, {
        channelId: channelId,
        userId: userId,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : remove admin failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelSettings", channelId]),
    }
  );
  return (
    <div className="relative flex w-8 flex-col items-center justify-start">
      {userRole === ChannelUserRole.ADMIN ? (
        <RemoveAdminIcon
          onMouseOver={() => setShowInfoAdmin(true)}
          onMouseOut={() => {
            setShowInfoAdmin(false);
          }}
          onClick={() => {
            removeAdmin.mutate({
              channelId: channelId,
              userId: id,
            });
          }}
          className="w-6 border-2 border-slate-300 text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
        />
      ) : (
        <AdminIcon
          onClick={() => {
            addAdmin.mutate({
              channelId: channelId,
              userId: id,
            });
          }}
          onMouseOver={() => setShowInfoAdmin(true)}
          onMouseOut={() => {
            setShowInfoAdmin(false);
          }}
          className="w-6 border-2 border-slate-300 text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
        />
      )}
      <span
        className={`${
          showInfoAdmin ? "opacity-100" : "opacity-0 "
        } absolute top-6 w-24 text-center text-xs text-slate-400 `}
      >
        {userRole === ChannelUserRole.ADMIN ? "Remove admin" : "Add as admin"}
      </span>
    </div>
  );
};

const UserHeader = ({
  user,
  userRole,
  userStatus,
}: {
  user:
    | ChannelSettingsQuery["channel"]["members"][number]
    | ChannelSettingsQuery["channel"]["banned"][number]["user"];
  userRole: ChannelUserRole;
  userStatus: ChannelUserStatus;
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex grow hover:cursor-pointer"
      onClick={() => navigate(`/profile/${user.id}`)}
    >
      <img
        src={`${user.avatar}`}
        alt="Player avatar"
        className="my-1 ml-1 h-12 w-12 border border-black"
      />
      <div className="ml-2 flex flex-col justify-center text-xs">
        <div className="flex">
          <span className="truncate text-base font-bold">{user.name}</span>
          <div className="mx-2 flex shrink-0">
            {userStatus === ChannelUserStatus.BANNED ? (
              <BanIcon className="w-4 text-red-600" />
            ) : null}
            {userStatus === ChannelUserStatus.MUTED ? (
              <MuteIcon className="w-4 text-orange-300" />
            ) : null}
          </div>
        </div>
        <span className="text-xs">
          {userRole === ChannelUserRole.OWNER
            ? "Owner"
            : userRole === ChannelUserRole.ADMIN
            ? "Admin"
            : "Member"}
        </span>
      </div>
    </div>
  );
};

const UserBanner = ({
  channelId,
  user,
  userRole,
  userStatus,
  currentUserRole,
}: {
  channelId: number;
  user:
    | ChannelSettingsQuery["channel"]["members"][number]
    | ChannelSettingsQuery["channel"]["banned"][number]["user"];
  userRole: ChannelUserRole;
  userStatus: ChannelUserStatus;
  currentUserRole: ChannelUserRole;
}) => {
  return (
    <li
      className={`${
        userStatus === ChannelUserStatus.BANNED
          ? "bg-red-200 hover:bg-red-300"
          : "bg-slate-50 hover:bg-slate-100"
      } flex w-full shrink-0 items-end justify-center pr-2 transition-all `}
    >
      <UserHeader user={user} userRole={userRole} userStatus={userStatus} />
      <div className="flex justify-center self-center">
        {userStatus !== ChannelUserStatus.BANNED ? (
          <>
            {currentUserRole === ChannelUserRole.OWNER &&
            userRole !== ChannelUserRole.OWNER ? (
              <ToggleAdminRole
                id={user.id}
                channelId={channelId}
                userRole={userRole}
              />
            ) : null}
            {(currentUserRole === ChannelUserRole.OWNER &&
              userRole !== ChannelUserRole.OWNER) ||
            (currentUserRole === ChannelUserRole.ADMIN &&
              userRole === ChannelUserRole.MEMBER) ? (
              <ToggleMuteStatus
                id={user.id}
                channelId={channelId}
                userStatus={userStatus}
              />
            ) : null}
          </>
        ) : null}
        {(currentUserRole === ChannelUserRole.OWNER &&
          userRole !== ChannelUserRole.OWNER) ||
        (currentUserRole === ChannelUserRole.ADMIN &&
          userRole === ChannelUserRole.MEMBER) ||
        ((currentUserRole === ChannelUserRole.OWNER ||
          currentUserRole === ChannelUserRole.ADMIN) &&
          userRole === ChannelUserRole.NON_MEMBER) ? (
          <ToggleBanStatus
            id={user.id}
            channelId={channelId}
            userStatus={userStatus}
          />
        ) : null}
      </div>
    </li>
  );
};

const SearchBar = ({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) => {
  const input = useRef<HTMLInputElement>(null);

  const resetSearch = () => {
    if (input.current) input.current.value = "";
    setSearch("");
  };

  return (
    <div className="relative flex w-full  self-end border-t bg-slate-100">
      <AddMemberIcon className="flex w-10 self-center border-r-2 text-slate-400 " />
      <input
        type="text"
        ref={input}
        spellCheck={false}
        className="w-full py-1 px-2 text-lg focus:outline-none focus:ring-2 focus:ring-inset"
        placeholder="Add member"
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.code == "Escape" && search.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            resetSearch();
          }
        }}
      />
      <div className="absolute right-2 bottom-px">
        {search.length > 0 ? (
          <button onClick={resetSearch}>
            <CloseIcon className="h-6 text-slate-400" />
          </button>
        ) : (
          <SearchIcon className="mb-1 h-6 text-slate-400" />
        )}
      </div>
    </div>
  );
};

const SearchResults = ({
  searchInput,
  channel,
}: {
  searchInput: string;
  channel: ChannelQueryResult;
}) => {
  const updateMembers = useMutation(
    async ({ channelId, userId }: { channelId: number; userId: number }) =>
      request("/graphql", InviteUserMutationDocument, {
        channelId: channelId,
        userId: userId,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : invite user failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["ChannelSettings", channel.id]),
    }
  );

  const { data: searchResults } = useQuery({
    queryKey: ["Users"],
    queryFn: async () =>
      request("/graphql", SearchUsersQueryDocument, {
        name: searchInput,
      }),
    select(data) {
      return data.users.filter((u) => {
        if (u === null) return false;
        const pred = (m: typeof channel.members[number]) => m.id !== u.id;
        return !channel.members.some(pred) && !channel.admins.some(pred);
      }) as Exclude<SearchUsersQuery["users"][number], null>[];
    },
  });

  return (
    <div className="flex flex-col  divide-y divide-slate-200 overflow-y-scroll">
      {typeof searchResults === "undefined" ? (
        <Empty message="Connection error" Icon={ConnectionErrorIcon} />
      ) : searchResults.length === 0 ? (
        <Empty message="No result" Icon={SearchIcon} />
      ) : (
        <ul>
          {searchResults.map((result, index) => (
            <li
              key={index}
              className="flex items-center bg-slate-100 p-2 even:bg-white hover:cursor-pointer hover:bg-blue-100"
              onClick={() => {
                updateMembers.mutate({
                  channelId: channel.id,
                  userId: result?.id,
                });
              }}
            >
              <Avatar.Root>
                <Avatar.Image
                  className="h-10 w-10 border border-black object-cover"
                  src={`uploads/avatars/${result?.avatar}`}
                />
                <Avatar.Fallback>
                  <UserIcon className="h-10 w-10" />
                </Avatar.Fallback>
              </Avatar.Root>
              {result?.name !== undefined ? (
                <Highlight content={result.name} searchInput={searchInput} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const LeaveChannelConfirm = ({
  channelId,
  setConfirmation,
}: {
  channelId: number;
  setConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();

  const leaveChannel = useMutation(
    async ({ channelId }: { channelId: number }) =>
      request("/graphql", LeaveChannelMutationDocument, {
        channelId: channelId,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : leave channel failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["DiscussionsAndInvitations"]),
    }
  );

  return (
    <div className="absolute top-0 right-0 z-10 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-30">
      <div
        className="flex w-full grow"
        onClick={() => setConfirmation(false)}
      ></div>
      <div className="flex h-48 w-full">
        <div
          className="flex h-full basis-1/5"
          onClick={() => setConfirmation(false)}
        />
        <div className="flex h-full w-full grow items-center justify-center border-2 bg-slate-50 shadow-md shadow-neutral-700">
          <div className="flex flex-col items-center">
            <div className=" mt-4  text-center">
              <p className="font-bold">Leave the channel ?</p>
            </div>
            <div className="mt-4 flex flex-row text-center">
              <button
                onClick={() => {
                  leaveChannel.mutate({ channelId: channelId });
                  navigate("/");
                }}
                className="block w-full border-2 border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-slate-200 "
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmation(false)}
                className="ml-2 block w-full border-2 border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold  hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div
          className="flex h-full basis-1/5"
          onClick={() => setConfirmation(false)}
        />
      </div>
      <div
        className="flex w-full grow"
        onClick={() => setConfirmation(false)}
      ></div>
    </div>
  );
};

const DeleteConfirm = ({
  channelId,
  setConfirmation,
}: {
  channelId: number;
  setConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();

  const deleteChannel = useMutation(
    async ({ channelId }: { channelId: number }) =>
      request("/graphql", DeleteChannelMutationDocument, {
        channelId: channelId,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : delete channel failed");
      },
      onSuccess: () =>
        queryClient.invalidateQueries(["DiscussionsAndInvitations"]),
    }
  );

  return (
    <div className="absolute top-0 right-0 z-10 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-30">
      <div
        className="flex w-full grow"
        onClick={() => setConfirmation(false)}
      />
      <div className="flex h-48 w-full">
        <div
          className="flex h-full basis-1/5"
          onClick={() => setConfirmation(false)}
        />
        <div className="flex h-full w-full grow items-center justify-center border-2 bg-slate-50 shadow-md shadow-neutral-700">
          <div className="flex flex-col items-center">
            <div className="mt-4 text-center">
              <p className="font-bold">Delete your Channel ?</p>
              <p className="mt-1 text-sm text-gray-700">
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-4 flex flex-row text-center">
              <button
                onClick={() => {
                  deleteChannel.mutate({ channelId: channelId });
                  navigate("/");
                }}
                className="block w-full border-2 border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-slate-200 "
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmation(false)}
                className="ml-2 block w-full border-2 border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold  hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div
          className="flex h-full basis-1/5"
          onClick={() => setConfirmation(false)}
        />
      </div>
      <div
        className="flex w-full grow"
        onClick={() => setConfirmation(false)}
      ></div>
    </div>
  );
};

type ChangePasswordFormData = {
  password?: string;
};
const ChannelMode = ({
  channelId,
  activeMode,
  changesAuthorized,
}: {
  channelId: number;
  activeMode: string;
  changesAuthorized: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>();

  const updatePassword = useMutation(
    async ({
      password,
      channelId,
    }: {
      password: string | undefined;
      channelId: number;
    }) =>
      request("/graphql", UpdatePasswordMutationDocument, {
        channelId: channelId,
        password: password,
      }),
    {
      onError: () => {
        const pushError = useErrorStore((state) => state.pushError);
        pushError("Error : delete channel failed");
      },
      onSuccess: () => {
        setShowPasswordField(false);
        reset();
      },
    }
  );

  const [showPasswordField, setShowPasswordField] = useState(false);

  return (
    <form
      className="mt-4 flex h-full flex-col"
      onSubmit={handleSubmit((data) => {
        showPasswordField
          ? updatePassword.mutate({
              password: data.password,
              channelId: channelId,
            })
          : null;
      })}
    >
      <div className="flex w-full ">
        <div className="flex h-10 basis-1/2">Mode : {activeMode}</div>
        {changesAuthorized && activeMode !== "Private" && (
          <div className="flex w-full">
            <button
              onClick={() => {
                setShowPasswordField(!showPasswordField), reset();
              }}
              className="mr-1 h-6  basis-1/2 border-2 border-slate-200 bg-slate-100 text-xs hover:cursor-pointer hover:bg-slate-200"
            >
              {activeMode === "Password" && !showPasswordField
                ? "Change password"
                : activeMode === "Public" && !showPasswordField
                ? "Add password"
                : "Cancel"}
            </button>
            {activeMode === "Password" && (
              <button
                onClick={() => {
                  !showPasswordField
                    ? updatePassword.mutate({
                        channelId: channelId,
                        password: undefined, //null?
                      })
                    : null;
                }}
                className={`${
                  activeMode === "Password" && showPasswordField
                    ? "opacity-20 hover:cursor-not-allowed"
                    : "hover:cursor-pointer hover:bg-slate-200"
                } h-6 basis-1/2 border-2  border-slate-200 bg-slate-100 text-xs `}
              >
                Remove Password
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-2 flex h-full items-center justify-start">
        {changesAuthorized && activeMode !== "Private" ? (
          <div
            className={`${
              showPasswordField ? "opacity-100" : "opacity-10"
            } flex items-center justify-center`}
          >
            <label className="mr-2 text-sm text-slate-400" htmlFor="Password">
              {activeMode === "Password" ? "New password: " : "Password: "}
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: showPasswordField,
                  maxLength: 100,
                })}
                type="password"
                autoComplete="off"
                defaultValue=""
                disabled={!showPasswordField}
                autoFocus={showPasswordField}
                className={`${
                  showPasswordField && errors.password
                    ? "ring-1 ring-red-500"
                    : "ring-0 "
                }  h-7 w-48 self-center px-1 text-xs`}
              />

              {errors.password && showPasswordField && (
                <span
                  className="absolute -bottom-4 -left-0 w-full text-center text-xs text-red-600"
                  role="alert"
                >
                  You must set a password
                </span>
              )}
            </div>
            <input
              className={`${
                showPasswordField
                  ? "hover:cursor-pointer hover:bg-slate-300"
                  : "hover:cursor-not-allowed"
              } ml-3 flex w-fit justify-center self-center border border-slate-300 bg-slate-200 px-1 text-center text-xs font-bold `}
              type="submit"
            />
          </div>
        ) : null}
      </div>
    </form>
  );
};

const ChannelHeader = ({
  isOwner,
  channelId,
  channelName,
  privateMode,
  passwordProtected,
  setDeleteConfirmation,
  setLeaveConfirmation,
}: {
  isOwner: boolean;
  channelId: number;
  channelName: string | undefined;
  privateMode: boolean | undefined;
  passwordProtected: boolean | undefined;
  setDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  setLeaveConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="relative flex w-full flex-col border-b-2 p-2">
      <div className="absolute top-1 right-1 flex">
        <LeaveIcon
          className="mt-1 w-8 self-center text-lg text-slate-500 hover:cursor-pointer hover:text-slate-700"
          onClick={() => {
            setLeaveConfirmation(true);
          }}
        />
      </div>
      <div className="mt-1 ml-1 flex h-full w-full items-center">
        <div className="relative flex h-28 w-28 shrink-0 justify-center self-center border border-slate-400 bg-white">
          {isOwner ? (
            <TrashIcon
              className="absolute -top-2 -right-2 w-6 self-center border border-black bg-white text-lg text-black shadow-sm shadow-black hover:cursor-pointer hover:bg-slate-200"
              onClick={() => {
                setDeleteConfirmation(true);
              }}
            />
          ) : null}
          <UsersIcon className="mt-2 h-20 w-20 self-center text-slate-700 " />
        </div>
        <div className="ml-4 flex h-full w-full flex-col">
          <div className="pt-2 text-left text-2xl font-bold">
            Channel : {channelName}
          </div>
          <ChannelMode
            channelId={channelId}
            activeMode={
              privateMode
                ? "Private"
                : passwordProtected
                ? "Password"
                : "Public"
            }
            changesAuthorized={isOwner}
          />
        </div>
      </div>
    </div>
  );
};

const MemberList = ({
  channel,
  currentUserRole,
}: {
  channel: ChannelQueryResult;
  currentUserRole: ChannelUserRole;
}) => {
  const isInList = (
    id: number,
    userList: typeof channel.banned | typeof channel.muted
  ) => {
    return userList.some((u) => u.user.id === id);
  };
  return (
    <div className="flex h-full w-full flex-col overflow-auto">
      <span className="ml-1 pt-5 text-left text-xl font-bold text-slate-700">
        MEMBERS
      </span>
      <ul>
        <UserBanner
          channelId={channel.id}
          user={channel.owner}
          userRole={ChannelUserRole.OWNER}
          userStatus={ChannelUserStatus.OK}
          currentUserRole={currentUserRole}
        />
        {channel.admins.map((user, index) => (
          <UserBanner
            key={index}
            channelId={channel.id}
            user={user}
            userRole={ChannelUserRole.ADMIN}
            userStatus={
              isInList(user.id, channel.muted)
                ? ChannelUserStatus.MUTED
                : ChannelUserStatus.OK
            }
            currentUserRole={currentUserRole}
          />
        ))}
        {channel.members.map((user, index) => (
          <UserBanner
            key={index}
            channelId={channel.id}
            user={user}
            userRole={ChannelUserRole.MEMBER}
            userStatus={
              isInList(user.id, channel.muted)
                ? ChannelUserStatus.MUTED
                : ChannelUserStatus.OK
            }
            currentUserRole={currentUserRole}
          />
        ))}
      </ul>
      <span className="ml-1 pt-5 text-left text-xl font-bold text-slate-700">
        BANNED USERS
      </span>
      <ul>
        {channel.banned.map((user, index) => (
          <UserBanner
            key={index}
            channelId={channel.id}
            user={user.user}
            userRole={ChannelUserRole.NON_MEMBER}
            userStatus={ChannelUserStatus.BANNED}
            currentUserRole={currentUserRole}
          />
        ))}
      </ul>
      {channel.banned.length === 0 ? (
        <span className="mt-4 w-full text-center text-lg text-slate-300">
          No one is banned
        </span>
      ) : null}
    </div>
  );
};

export default function ChannelSettings() {
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [leaveConfirmation, setLeaveConfirmation] = useState(false);
  const [search, setSearch] = useState("");

  const userId = useAuthStore((state) => state.userId);
  if (!userId) {
    return <Navigate to={"/"} replace={true} />;
  }

  const params = useParams();
  if (typeof params.channelId === "undefined")
    return <Navigate to={"/"} replace={true} />;
  const channelId = +params.channelId;

  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof channelSettingsLoader>
  >;
  const { data: channel } = useQuery({ ...query(channelId), initialData });
  if (typeof channel === "undefined")
    return <Navigate to={"/"} replace={true} />;

  const currentUserRole =
    channel.owner.id === userId
      ? ChannelUserRole.OWNER
      : channel.admins.some((admin) => admin.id === userId)
      ? ChannelUserRole.ADMIN
      : channel.members.some((member) => member.id === userId)
      ? ChannelUserRole.MEMBER
      : ChannelUserRole.NON_MEMBER;

  return (
    <>
      <Header>
        <>
          <HeaderLeftBtn>
            <HeaderNavigateBack />
          </HeaderLeftBtn>
          <HeaderCenterContent>
            <div className="flex h-full items-center justify-center">
              <SettingsIcon className="mr-2 w-6" />
              <div className="select-none truncate ">{channel.name}</div>
            </div>
          </HeaderCenterContent>
        </>
      </Header>
      <div className="relative flex h-full w-full flex-col ">
        {deleteConfirmation ? (
          <DeleteConfirm
            channelId={channelId}
            setConfirmation={setDeleteConfirmation}
          />
        ) : leaveConfirmation ? (
          <LeaveChannelConfirm
            channelId={channelId}
            setConfirmation={setLeaveConfirmation}
          />
        ) : null}
        <div
          className={`${
            deleteConfirmation || leaveConfirmation ? "blur-sm" : ""
          }  flex h-full w-full flex-col`}
        >
          <ChannelHeader
            isOwner={currentUserRole === ChannelUserRole.OWNER}
            channelId={channel.id}
            channelName={channel.name}
            privateMode={channel.private}
            passwordProtected={channel.passwordProtected}
            setDeleteConfirmation={setDeleteConfirmation}
            setLeaveConfirmation={setLeaveConfirmation}
          />
          <MemberList channel={channel} currentUserRole={currentUserRole} />
          {currentUserRole === ChannelUserRole.OWNER ||
          currentUserRole === ChannelUserRole.ADMIN ? (
            <div
              className={`${
                search.length === 0
                  ? "border-t-0"
                  : "absolute bottom-0 z-10 max-h-80 border-t-2 border-slate-200 shadow-[0_10px_10px_10px_rgba(0,0,0,0.5)]"
              }  mt-5 flex w-full flex-col justify-end `}
            >
              {search.length > 0 ? (
                <SearchResults searchInput={search} channel={channel} />
              ) : null}
              <SearchBar search={search} setSearch={setSearch} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
