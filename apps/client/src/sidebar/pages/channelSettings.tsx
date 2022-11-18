import {
  Params,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ChannelSettingsQuery,
  useBannedSomeoneChannelMutation,
  useChannelSettingsQuery,
  useDeleteChannelMutation,
  useDeleteMutedMutation,
  useMutedSomeoneChannelMutation,
  useSearchUsersChannelsQuery,
  useUpdateAdminsMutation,
  useDeleteBannedMutation,
  useUpdateRightMutation,
  useUpdateMembersMutation,
  Exact,
  InputMaybe,
  MutedSomeoneChannelMutation,
  BannedSomeoneChannelMutation,
} from "../../graphql/generated";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as TrashIcon } from "pixelarticons/svg/trash.svg";
import { ReactComponent as MuteIcon } from "pixelarticons/svg/volume-x.svg";
import { ReactComponent as UnmuteIcon } from "pixelarticons/svg/volume.svg";
import { ReactComponent as UnbanIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as AddMemberIcon } from "pixelarticons/svg/user-plus.svg";
import { ReactComponent as BanIcon } from "pixelarticons/svg/user-x.svg";
import { ReactComponent as AdminIcon } from "pixelarticons/svg/briefcase-plus.svg";
import { ReactComponent as CloseIcon } from "pixelarticons/svg/close.svg";
import { ReactComponent as SearchIcon } from "pixelarticons/svg/search.svg";
import { useRef, useState } from "react";
import { useThrottledState } from "@react-hookz/web";
import * as Avatar from "@radix-ui/react-avatar";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { useForm } from "react-hook-form";
import { HeaderPortal } from "../layout";
import { User } from "./chat";
import queryClient from "../../query";
import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseMutationResult,
} from "@tanstack/react-query";

const query = (
  channelId: number
): UseQueryOptions<ChannelSettingsQuery, unknown, Channelsetquery> => {
  return {
    queryKey: useChannelSettingsQuery.getKey({
      userId: null,
      channelId: channelId,
    }),
    queryFn: useChannelSettingsQuery.fetcher({
      userId: null,
      channelId: channelId,
    }),
    select: (channel) => ({
      user: {
        id: channel.user.id,
      },
      channel: channel.channel,
    }),
  };
};

export const channelset =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Params<"channelId"> }) => {
    if (params.channelId) {
      const channelId = +params.channelId;
      return queryClient.fetchQuery(query(channelId));
    }
  };

type Channelsetquery = {
  user: {
    id: number;
  };
  channel: ChannelInfo;
};
/********************************************************************/
/*                               TYPES                              */
/********************************************************************/
type ChannelInfo = {
  __typename?: "Channel";
  name: string;
  id: number;
  private: boolean;
  passwordProtected: boolean;
  owner: {
    __typename?: "User";
    id: number;
    name: string;
    avatar: string;
    rank: number;
  };
  admins: {
    __typename?: "User";
    id: number;
    name: string;
    avatar: string;
    rank: number;
  }[];
  members: {
    __typename?: "User";
    id: number;
    name: string;
    avatar: string;
    rank: number;
  }[];
  banned: {
    __typename?: "RestrictedMember";
    id: number;
    endAt?: number | null;
  }[];
  muted: {
    __typename?: "RestrictedMember";
    endAt?: number | null;
    id: number;
  }[];
};

type RestrictionTime = {
  text: string;
  date: number | null | undefined;
};

/********************************************************************/
/*                            USER BANNERS                          */
/********************************************************************/

/* *********************** BAN / MUTE ELEMENTS ******************** */
const restrictionTimeArray: RestrictionTime[] = [
  {
    text: "1h",
    date: Math.floor(new Date() as unknown as number) + 60 * 60 * 2 * 1000,
  },
  {
    text: "8h",
    date: Math.floor(new Date() as unknown as number) + 60 * 60 * 9 * 1000,
  },
  {
    text: "24h",
    date: Math.floor(new Date() as unknown as number) + 60 * 60 * 25 * 1000,
  },
  {
    text: "Forever",
    date: null,
  },
];

const SetRestrictionTimeButton = ({
  setShowTime,
  action,
  channelId,
  id,
  date,
  text,
}: {
  setShowTime: React.Dispatch<React.SetStateAction<boolean>>;
  action: UseMutationResult<
    MutedSomeoneChannelMutation | BannedSomeoneChannelMutation,
    unknown,
    Exact<{
      createMutedId: number;
      channelId: number;
      date?: InputMaybe<number> | undefined;
    }>,
    unknown
  >;

  channelId: number | undefined;
  id: number | undefined;
  date: number | undefined | null;
  text: string;
}) => {
  return (
    <div
      className="hover:bg-slate-300"
      onClick={() => {
        setShowTime(false),
          action.mutate({
            channelId: channelId ? channelId : 0,
            createMutedId: id ? id : 0,
            date: date,
          });
      }}
    >
      {text}
    </div>
  );
};

const ChooseTimeButton = ({
  id,
  channelId,
  action,
  showTime,
  setShowTime,
}: {
  action:
    | UseMutationResult<
        MutedSomeoneChannelMutation,
        unknown,
        Exact<{
          createMutedId: number;
          channelId: number;
          date?: InputMaybe<number> | undefined;
        }>,
        unknown
      >
    | UseMutationResult<
        BannedSomeoneChannelMutation,
        unknown,
        Exact<{
          createMutedId: number;
          channelId: number;
          date?: InputMaybe<number> | undefined;
        }>,
        unknown
      >;
  channelId: number | undefined;
  id: number | undefined;
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
            setShowTime={setShowTime}
            action={action}
            channelId={channelId}
            id={id}
            {...restrictionTime}
          />
        );
      })}
    </div>
  );
};

const MuteButton = ({
  id,
  channelId,
  muted,
}: {
  id: number | undefined;
  channelId: number | undefined;
  muted: boolean | undefined;
}) => {
  const [showInfoMute, setShowInfoMute] = useState(false);
  const [showTimeMute, setShowTimeMute] = useState(false);
  const mutedSomeone = useMutedSomeoneChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });

  const deleteMutedSomeone = useDeleteMutedMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
  return (
    <div className="relative flex w-8 flex-col text-center transition-all hover:cursor-pointer">
      <div
        onMouseLeave={() => setShowTimeMute(false)}
        className={`${
          showTimeMute
            ? "visible h-fit w-10 border-2 opacity-100"
            : "hidden h-0 w-0 opacity-0"
        } absolute -left-1 -top-5 z-10 flex-col border-slate-300 bg-slate-200 text-center text-xs text-slate-700 transition-all`}
      >
        <ChooseTimeButton
          setShowTime={setShowTimeMute}
          action={mutedSomeone}
          channelId={channelId}
          id={id}
          showTime={showTimeMute}
        />
      </div>
      <div
        className="flex flex-col items-center justify-center"
        onClick={() => {
          !muted ? setShowTimeMute(true) : "";
        }}
      >
        {muted ? (
          <UnmuteIcon
            onMouseOver={() => setShowInfoMute(true)}
            onMouseOut={() => {
              setShowInfoMute(false);
            }}
            onClick={() => {
              deleteMutedSomeone.mutate({
                channel: channelId ? channelId : 0,
                userId: id ? id : 0,
              });
            }}
            className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
          />
        ) : (
          <MuteIcon
            onMouseOver={() => setShowInfoMute(true)}
            onMouseOut={() => {
              setShowInfoMute(false);
            }}
            onClick={() => setShowTimeMute(true)}
            className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
          />
        )}
        <div
          className={`${
            showInfoMute ? "opacity-100" : "opacity-0 "
          } absolute top-6 w-24 text-center text-xs text-slate-400`}
        >
          {muted ? "Unmute" : "Mute"}
        </div>
      </div>
    </div>
  );
};

const BanButton = ({
  id,
  channelId,
  banned,
}: {
  id: number | undefined;
  channelId: number | undefined;
  banned: boolean | undefined;
}) => {
  const [showInfoBan, setShowInfoBan] = useState(false);
  const [showTimeBan, setShowTimeBan] = useState(false);

  const bannedSomeone = useBannedSomeoneChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });

  const deleteBannedSomeone = useDeleteBannedMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
  return (
    <div className="relative flex w-8 flex-col justify-end text-center transition-all hover:cursor-pointer">
      <ChooseTimeButton
        setShowTime={setShowTimeBan}
        action={bannedSomeone}
        channelId={channelId}
        id={id}
        showTime={showTimeBan}
      />
      <div
        className="flex flex-col items-center justify-center"
        onClick={() => (!banned ? setShowTimeBan(true) : "")}
      >
        {banned ? (
          <UnbanIcon
            onMouseOver={() => setShowInfoBan(true)}
            onMouseOut={() => setShowInfoBan(false)}
            className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
            onClick={() => {
              deleteBannedSomeone.mutate({
                channel: channelId ? channelId : 0,
                userId: id ? id : 0,
              });
            }}
          />
        ) : (
          <BanIcon
            onMouseOver={() => setShowInfoBan(true)}
            onMouseOut={() => setShowInfoBan(false)}
            className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
          />
        )}
        <div
          className={`${
            showInfoBan ? "opacity-100" : "opacity-0 "
          } absolute top-6 w-8 text-center text-xs text-slate-400`}
        >
          {banned ? "Unban" : "Ban"}
        </div>
      </div>
    </div>
  );
};

/* *********************** ADMIN ELEMENT ******************** */

const SetAsAdminButton = ({
  id,
  channelId,
}: {
  id: number | undefined;
  channelId: number | undefined;
}) => {
  const [showInfoAdmin, setShowInfoAdmin] = useState(false);

  const updateAdmins = useUpdateAdminsMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
  return (
    <div
      className="relative flex w-8 flex-col items-center justify-start"
      onClick={() => {
        updateAdmins.mutate({
          channelId: channelId ? channelId : 0,
          userId: id ? id : 0,
        });
      }}
    >
      {" "}
      <AdminIcon
        onMouseOver={() => setShowInfoAdmin(true)}
        onMouseOut={() => {
          setShowInfoAdmin(false);
        }}
        className="w-6 border-2 border-slate-300 text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
      />
      <div
        className={`${
          showInfoAdmin ? "opacity-100" : "opacity-0 "
        } absolute top-6 w-24 text-center text-xs text-slate-400 `}
      >
        Set as admin
      </div>
    </div>
  );
};

/* *********************** SHARED ELEMENT ******************** */
const UserHeader = ({
  id,
  name,
  avatar,
  banned,
  muted,
  owner,
  admin,
}: {
  id: number | undefined;
  name: string | undefined;
  avatar: string | undefined;
  banned: boolean | undefined;
  muted: boolean | undefined;
  owner: boolean;
  admin: boolean;
}) => {
  const navigate = useNavigate();
  return (
    <div
      className="flex grow hover:cursor-pointer"
      onClick={() => navigate(`/profile/${id}`)}
    >
      {typeof avatar !== undefined && avatar !== "" ? (
        <img
          src={avatar}
          alt="Player avatar"
          className="ml-1 mt-1 h-12 w-12 border border-black"
        />
      ) : (
        <UserIcon className="mt-1 h-12 w-12 border border-black text-neutral-700" />
      )}
      <div className="ml-2 flex flex-col justify-center text-xs">
        <div className="flex">
          <span className="truncate text-base font-bold ">{name}</span>
          <div className="mx-2 flex shrink-0">
            {banned ? <BanIcon className="w-4 text-red-600" /> : null}
            {muted ? <MuteIcon className="w-4 text-red-300" /> : null}
          </div>
        </div>
        <div className="text-xs">
          {owner ? "Owner" : admin ? "Admin" : "Member"}
        </div>
      </div>
    </div>
  );
};

/* *********************** MAIN COMPONENT ******************** */
const UserBanner = ({
  id,
  name,
  avatar,
  admin,
  owner,
  muted,
  banned,
  changesAuthorizedAsAdmin,
  changesAuthorizedAsOwner,
  channelId,
}: {
  channelId: number | undefined;
  id: number | undefined;
  name: string | undefined;
  avatar: string | undefined;
  admin: boolean;
  owner: boolean;
  muted: boolean | undefined;
  banned: boolean | undefined;
  changesAuthorizedAsAdmin: boolean;
  changesAuthorizedAsOwner: boolean;
}) => {
  return (
    <>
      <div className="flex w-full shrink-0 items-end justify-center pr-2 transition-all hover:bg-slate-100 ">
        <UserHeader
          id={id}
          name={name}
          avatar={avatar}
          admin={admin}
          owner={owner}
          banned={banned}
          muted={muted}
        />
        <div className="flex justify-center self-center">
          {changesAuthorizedAsOwner && !admin && !owner ? (
            <SetAsAdminButton id={id} channelId={channelId} />
          ) : (
            <div></div>
          )}
          {(admin && changesAuthorizedAsOwner) ||
          (!admin && changesAuthorizedAsAdmin) ? (
            <MuteButton id={id} channelId={channelId} muted={muted} />
          ) : (
            <div></div>
          )}
          {(admin && changesAuthorizedAsOwner) ||
          (!admin && changesAuthorizedAsAdmin) ? (
            <BanButton id={id} channelId={channelId} banned={banned} />
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </>
  );
};

/********************************************************************/
/*                        SEARCH BAR                                */
/********************************************************************/
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
    <div className="relative flex w-full shrink-0 grow-0 self-end border-t-2 bg-slate-100">
      <AddMemberIcon className="flex h-full w-10 self-center border-r-2 text-slate-400 " />
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

const Search = ({
  search,
  queryData,
  channelId,
}: {
  search: string;
  queryData: ChannelSettingsQuery;
  channelId: number;
}) => {
  const { data } = useSearchUsersChannelsQuery(
    { name: search },
    {
      select(data) {
        const { users } = data;
        const results: typeof users[number][] = [...users];
        return results;
      },
    }
  );
  const updateMembers = useUpdateMembersMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
  return (
    <div className="flex h-full flex-col justify-end divide-y divide-slate-200">
      {data?.map((result, index) => (
        <div key={index}>
          {!queryData.channel.members.some((u) => u.id === result?.id) &&
          !queryData.channel.admins.some((u) => u.id === result?.id) ? (
            <div
              className="flex items-center p-2 even:bg-white hover:cursor-pointer hover:bg-blue-100"
              onClick={() => {
                result?.id !== undefined
                  ? updateMembers.mutate({
                      channelId: channelId,
                      userId: result?.id,
                    })
                  : "";
              }}
            >
              <>
                <Avatar.Root>
                  <Avatar.Image
                    className="h-10 w-10 border border-black object-cover"
                    src={result?.avatar}
                  />
                  <Avatar.Fallback>
                    <UserIcon className="h-10 w-10" />
                  </Avatar.Fallback>
                </Avatar.Root>
                {result?.name !== undefined ? (
                  <Highlight content={result?.name} search={search} />
                ) : (
                  <></>
                )}
              </>
            </div>
          ) : (
            <></>
          )}
        </div>
      ))}
    </div>
  );
};

const Highlight = ({
  content,
  search,
}: {
  content: string;
  search: string;
}) => {
  const index = content.toLowerCase().indexOf(search.toLowerCase());
  const before = content.slice(0, index);
  const match = content.slice(index, index + search.length);
  const after = content.slice(index + search.length);

  return (
    <span className="ml-2">
      <span>{before}</span>
      <span className="bg-amber-300">{match}</span>
      <span>{after}</span>
    </span>
  );
};

/********************************************************************/
/*                           DELETE POPUP                           */
/********************************************************************/
const DeletePopUp = ({
  channelId,
  setConfirmation,
}: {
  channelId: number;
  setConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();

  const deleteChannel = useDeleteChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
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
              <p className="font-bold">Delete your Channel</p>
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

/********************************************************************/
/*                              HEADER                              */
/********************************************************************/

/********************************************************************/
/*                           CHANNEL MODE                           */
/********************************************************************/
const ChannelMode = ({
  idChannel,
  activeMode,
  changesAuthorized,
}: {
  idChannel: number;
  activeMode: string;
  changesAuthorized: boolean;
}) => {
  const { register, handleSubmit, watch } = useForm();
  const updateRight = useUpdateRightMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
  return (
    <div className="flex h-full flex-col">
      <form
        className="flex h-full flex-col"
        onSubmit={handleSubmit(() => {
          updateRight.mutate({
            idchannel: idChannel,
            inviteOnly: activeMode === "Private",
            password:
              activeMode === "Password protected" ? watch("Password") : "",
          });
        })}
      >
        <div className="mb-2 flex h-full ">Mode : {activeMode}</div>
        <div className="flex h-full items-center justify-start">
          {activeMode === "Password protected" && changesAuthorized ? (
            <div className="flex items-center justify-start ">
              <label
                className="mr-2 self-end text-sm text-slate-400"
                htmlFor="Password"
              >
                Enter new password :
              </label>
              <input
                {...register("Password", {
                  required: activeMode === "Password protected",
                  maxLength: 100,
                })}
                type="Password"
                autoComplete="off"
                defaultValue=""
                className="h-6 w-40 self-center px-1 text-xs"
              />
              <input
                className="ml-3 flex w-fit justify-center self-center border border-slate-300 bg-slate-200 px-1  text-center text-sm font-bold hover:cursor-pointer hover:bg-slate-300"
                type="submit"
              />
            </div>
          ) : (
            <></>
          )}
        </div>
      </form>
    </div>
  );
};

const ChannelHeader = ({
  isOwner,
  channelId,
  channelName,
  privateMode,
  passwordProtected,
  setDeleteConfirmation,
}: {
  isOwner: boolean;
  channelId: number | undefined;
  channelName: string | undefined;
  privateMode: boolean | undefined;
  passwordProtected: boolean | undefined;
  setDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="relative flex flex-col justify-center p-2">
      {isOwner ? (
        <div
          className="absolute right-1 top-1 flex w-fit justify-center self-center p-3 text-center text-lg text-slate-500 hover:cursor-pointer hover:text-slate-700"
          onClick={() => {
            setDeleteConfirmation(true);
          }}
        >
          <TrashIcon className="w-8 -translate-y-0.5" />
        </div>
      ) : (
        <div></div>
      )}
      <div className="flex w-full grow items-center">
        <div className="flex h-28 w-28 justify-center self-center border border-slate-400 bg-white">
          <UsersIcon className="mt-2 h-20 w-20 self-center text-slate-700 " />
        </div>
        <div className="mx-4 flex h-full flex-col ">
          <div className="text-left text-2xl font-bold">
            Channel : {channelName}
          </div>
          <div className="mt-2 flex flex-row ">
            <ChannelMode
              idChannel={channelId ? channelId : 0}
              activeMode={
                privateMode
                  ? "Private"
                  : passwordProtected
                  ? "Password protected"
                  : "Public"
              }
              changesAuthorized={isOwner}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/********************************************************************/
/*                               MEMBERS                            */
/********************************************************************/

const MemberList = ({
  channel,
  isAdmin,
  isOwner,
}: {
  channel: ChannelInfo;
  isAdmin: boolean;
  isOwner: boolean;
}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="ml-1 pt-5 text-left text-xl font-bold text-slate-700">
        MEMBERS
      </div>
      <UserBanner
        id={channel.owner.id}
        name={channel.owner.name}
        avatar={channel.owner.avatar}
        channelId={channel.id}
        admin={false}
        owner={true}
        muted={false}
        banned={false}
        changesAuthorizedAsAdmin={false}
        changesAuthorizedAsOwner={false}
      />
      {channel.admins.map((user, index) => {
        return !(user.id === channel.owner.id) ? (
          <UserBanner
            key={index}
            channelId={channel.id}
            id={user.id}
            name={user.name}
            avatar={user.avatar}
            admin={true}
            owner={false}
            muted={channel.muted?.some((u) => u.id === user.id)}
            banned={channel.banned?.some((u) => u.id === user.id)}
            changesAuthorizedAsAdmin={isAdmin}
            changesAuthorizedAsOwner={isOwner}
          />
        ) : null;
      })}
      {channel.members.map((user, index) => {
        return !channel.admins.some((admin) => admin.id === user.id) ? (
          <UserBanner
            key={index}
            channelId={channel.id}
            id={user.id}
            name={user.name}
            avatar={user.avatar}
            admin={false}
            owner={false}
            changesAuthorizedAsAdmin={isAdmin}
            changesAuthorizedAsOwner={isOwner}
            muted={channel.muted?.some((u) => u.id === user.id)}
            banned={channel.banned?.some((u) => u.id === user.id)}
          />
        ) : null;
      })}
    </div>
  );
};

/********************************************************************/
/*                        MAIN COMPONENT                            */
/********************************************************************/

export default function ChannelSettings() {
  const params = useParams();
  const [search, setSearch] = useThrottledState("", 500);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  if (typeof params.channelId === "undefined") return <div></div>;

  const channelId = +params.channelId;
  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof channelset>>
  >;
  const { data } = useQuery({ ...query(channelId), initialData });
  if (typeof data === "undefined") return <></>;
  const isOwner = data?.user.id === data?.channel.owner.id;
  const isAdmin = data?.channel.admins.some(
    (admin) => admin.id === data.user.id
  )
    ? true
    : false;
  return (
    <>
      {" "}
      <HeaderPortal
        container={document.getElementById("header") as HTMLElement}
        text="Go back to discussion"
        link={`/channel/${channelId}`}
        icon=""
      />
      <div className="relative flex h-full w-full flex-col ">
        {deleteConfirmation ? (
          <DeletePopUp
            channelId={channelId}
            setConfirmation={setDeleteConfirmation}
          />
        ) : (
          ""
        )}
        <div
          className={`${
            deleteConfirmation ? "blur-sm" : ""
          } flex h-full w-full flex-col`}
        >
          <ChannelHeader
            isOwner={isOwner}
            channelId={data.channel.id}
            channelName={data.channel.name}
            privateMode={data.channel.private}
            passwordProtected={data.channel.passwordProtected}
            setDeleteConfirmation={setDeleteConfirmation}
          />

          <MemberList
            channel={data.channel}
            isAdmin={isAdmin}
            isOwner={isOwner}
          />
          {isOwner || isAdmin ? (
            <div className="mt-5 flex h-full w-full flex-col justify-end overflow-auto">
              {search.length === 0 ? (
                ""
              ) : data ? (
                <Search
                  search={search}
                  queryData={data}
                  channelId={data?.channel.id ? data?.channel.id : 0}
                />
              ) : (
                <></>
              )}
              <SearchBar search={search} setSearch={setSearch} />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
