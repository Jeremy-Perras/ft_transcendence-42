import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  useAddAdminMutation,
  useBanUserMutation,
  useChannelSettingsQuery,
  useDeleteChannelMutation,
  useInviteUserMutation,
  useLeaveChannelMutation,
  useMuteUserMutation,
  useRemoveAdminMutation,
  useSearchUsersQuery,
  useUnbanUserMutation,
  useUnmuteUserMutation,
  useUpdateChannelPasswordMutation,
} from "../../graphql/generated";
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
import { useRef, useState } from "react";

import * as Avatar from "@radix-ui/react-avatar";

import { useForm } from "react-hook-form";

import {
  QueryClient,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

import {
  Header,
  HeaderCenterContent,
  HeaderLeftBtn,
  HeaderNavigateBack,
} from "../components/header";

type formData = {
  password?: string;
  type: "Private" | "Password" | "Public"; //TODO : check in subject if needed
};

type ChannelSettingsQuery = {
  user: {
    id: number;
  };
  channel: ChannelInfo;
};

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
  };
  admins: {
    __typename?: "User";
    id: number;
    name: string;
    avatar: string;
  }[];
  members: {
    __typename?: "User";
    id: number;
    name: string;
    avatar: string;
  }[];
  banned: {
    __typename?: "RestrictedMember";
    id: number;
    name: string;
    avatar: string;
    endAt?: number | null;
  }[];
  muted: {
    __typename?: "RestrictedMember";
    id: number;
    endAt?: number | null;
  }[];
};

const query = (
  channelId: number
): UseQueryOptions<ChannelSettingsQuery, unknown, ChannelSettingsQuery> => {
  return {
    queryKey: useChannelSettingsQuery.getKey({
      userId: null,
      channelId: channelId,
    }),
    queryFn: useChannelSettingsQuery.fetcher({
      userId: null,
      channelId: channelId,
    }),
    select: (data) => ({
      user: {
        id: data.user.id,
      },
      channel: data.channel,
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

/********************************************************************/
/*                            USER BANNERS                          */
/********************************************************************/

const MuteButton = ({
  currentUserId,
  id,
  channelId,
  muted,
}: {
  currentUserId: number;
  id: number;
  channelId: number;
  muted: boolean | undefined;
}) => {
  const [showInfoMute, setShowInfoMute] = useState(false);

  const queryClient = useQueryClient();
  const muteUser = useMuteUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: currentUserId,
          channelId: channelId,
        }),
      ]);
    },
  });
  const unmuteUser = useUnmuteUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: currentUserId,
          channelId: channelId,
        }),
      ]);
    },
  });

  return (
    <div className="relative flex w-8 flex-col justify-end text-center transition-all hover:cursor-pointer">
      <div className="flex flex-col items-center justify-center">
        {muted ? (
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
              muteUser.mutate({
                channelId: channelId,
                userId: id,
              });
            }}
            className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
          />
        )}
        <div
          className={`${
            showInfoMute ? "opacity-100" : "opacity-0 "
          } absolute top-6 w-8 text-center text-xs text-slate-400`}
        >
          {muted ? "Unmute" : "Mute"}
        </div>
      </div>
    </div>
  );
};

const BanButton = ({
  currentUserId,
  id,
  channelId,
  banned,
}: {
  currentUserId: number;
  id: number;
  channelId: number;
  banned: boolean | undefined;
}) => {
  const [showInfoBan, setShowInfoBan] = useState(false);

  const queryClient = useQueryClient();
  const banUser = useBanUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: null,
          channelId: channelId,
        }),
      ]);
    },
  });
  const unbanUser = useUnbanUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: currentUserId,
          channelId: channelId,
        }),
      ]);
    },
  });

  return (
    <div className="relative flex w-8 flex-col justify-end text-center transition-all hover:cursor-pointer">
      <div className="flex flex-col items-center justify-center">
        {banned ? (
          <UnbanIcon
            onMouseOver={() => setShowInfoBan(true)}
            onMouseOut={() => setShowInfoBan(false)}
            className="w-6 border-2 border-red-500  text-red-600 hover:cursor-pointer hover:border-red-700 hover:text-red-800"
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
              banUser.mutate({
                channelId: channelId,
                userId: id,
              });
            }}
            className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
          />
        )}
        <div
          className={`${showInfoBan ? "opacity-100" : "opacity-0 "} ${
            banned ? "text-red-500" : "text-slate-400"
          } absolute top-6 w-8 text-center text-xs`}
        >
          {banned ? "Unban" : "Ban"}
        </div>
      </div>
    </div>
  );
};

/* *********************** ADMIN ELEMENT ******************** */

const SetAsAdminButton = ({
  currentUserId,
  id,
  channelId,
}: {
  currentUserId: number;
  id: number;
  channelId: number;
}) => {
  const [showInfoAdmin, setShowInfoAdmin] = useState(false);

  const queryClient = useQueryClient();
  const addAdmin = useAddAdminMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: currentUserId,
          channelId: channelId,
        }),
      ]);
    },
  });

  return (
    <div
      className="relative flex w-8 flex-col items-center justify-start"
      onClick={() => {
        addAdmin.mutate({
          channelId: channelId,
          userId: id,
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

const UnsetAdminButton = ({
  currentUserId,
  id,
  channelId,
}: {
  currentUserId: number;
  id: number;
  channelId: number;
}) => {
  const [showInfoAdmin, setShowInfoAdmin] = useState(false);

  const queryClient = useQueryClient();
  const removeAdmin = useRemoveAdminMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: currentUserId,
          channelId: channelId,
        }),
      ]);
    },
  });

  return (
    <div
      className="relative flex w-8 flex-col items-center justify-start"
      onClick={() => {
        removeAdmin.mutate({
          channelId: channelId,
          userId: id,
        });
      }}
    >
      {" "}
      <RemoveAdminIcon
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
        Remove admin
      </div>
    </div>
  );
};

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
      <img
        src={`/uploads/avatars/${avatar}`}
        alt="Player avatar"
        className="my-1 ml-1 h-12 w-12 border border-black"
      />
      <div className="ml-2 flex flex-col justify-center text-xs">
        <div className="flex">
          <span className="truncate text-base font-bold ">{name}</span>
          <div className="mx-2 flex shrink-0">
            {banned ? <BanIcon className="w-4 text-red-600" /> : null}
            {muted ? <MuteIcon className="w-4 text-orange-300" /> : null}
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
  currentUserId,
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
  currentUserId: number;
  channelId: number;
  id: number;
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
      <div
        className={`${
          banned
            ? "bg-red-200 hover:bg-red-300"
            : "bg-slate-50 hover:bg-slate-100"
        } flex w-full shrink-0 items-end justify-center pr-2 transition-all `}
      >
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
          {changesAuthorizedAsOwner && !admin && !owner && !banned ? (
            <SetAsAdminButton
              currentUserId={currentUserId}
              id={id}
              channelId={channelId}
            />
          ) : changesAuthorizedAsOwner && admin && !owner && !banned ? (
            <UnsetAdminButton
              currentUserId={currentUserId}
              id={id}
              channelId={channelId}
            />
          ) : null}
          {(admin && changesAuthorizedAsOwner && !banned) ||
          (!admin && changesAuthorizedAsAdmin && !banned) ? (
            <MuteButton
              currentUserId={currentUserId}
              id={id}
              channelId={channelId}
              muted={muted}
            />
          ) : null}
          {changesAuthorizedAsOwner || changesAuthorizedAsAdmin ? (
            <BanButton
              currentUserId={currentUserId}
              id={id}
              channelId={channelId}
              banned={banned}
            />
          ) : null}
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
  userId,
}: {
  search: string;
  queryData: ChannelSettingsQuery;
  channelId: number;
  userId: number;
}) => {
  const queryClient = useQueryClient();
  const { data } = useSearchUsersQuery(
    { name: search },
    {
      select(data) {
        const { users } = data;
        const results: typeof users[number][] = [...users];
        return results;
      },
    }
  );
  const updateMembers = useInviteUserMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: userId,
          channelId: channelId,
        }),
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
/*                                 POPUPS                           */
/********************************************************************/
const LeaveChannelPopUp = ({
  userId,
  channelId,
  setConfirmation,
}: {
  userId: number;
  channelId: number;
  setConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const leaveChannel = useLeaveChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: userId,
          channelId: channelId,
        }),
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

const DeletePopUp = ({
  userId,
  channelId,
  setConfirmation,
}: {
  userId: number;
  channelId: number;
  setConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const deleteChannel = useDeleteChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: userId,
          channelId: channelId,
        }),
      ]);
    },
  });

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

/********************************************************************/
/*                              HEADER                              */
/********************************************************************/

/********************************************************************/
/*                           CHANNEL MODE                           */
/********************************************************************/
const ChannelMode = ({
  userId,
  channelId,
  activeMode,
  changesAuthorized,
}: {
  userId: number;
  channelId: number;
  activeMode: string;
  changesAuthorized: boolean;
}) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formData>();
  const updatePassword = useUpdateChannelPasswordMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        useChannelSettingsQuery.getKey({
          userId: userId,
          channelId: channelId,
        }),
      ]);
    },
  });
  //TODO : useEffect to set pw confirmation
  const [showConfirmation, setShowConfirmation] = useState(false);
  return (
    <div className="flex h-full flex-col">
      <form
        className="flex h-full flex-col"
        onSubmit={handleSubmit((data) => {
          updatePassword.mutate({
            channelId: channelId,
            // password: data.password,
          });
          setShowConfirmation(true);
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
                {...register("password", {
                  required: activeMode === "Password protected",
                  maxLength: 100,
                })}
                type="password"
                autoComplete="off"
                defaultValue=""
                autoFocus={true}
                className={`${
                  errors.password ? "ring-1 ring-red-500" : ""
                } my-2 h-10 w-64 self-center px-1 text-xs`}
              />
              {/* TODO: check in subject "remove password => set channel to public?" */}
              {errors.password && (
                <span className="text-center text-xs text-red-600" role="alert">
                  You must set a password
                </span>
              )}
              {showConfirmation && (
                <span
                  className="text-center text-xs text-slate-400"
                  role="alert"
                >
                  Password successfully updated
                </span>
              )}
              <input
                className="ml-3 flex w-fit justify-center self-center border border-slate-300 bg-slate-200 px-1 text-center text-sm font-bold hover:cursor-pointer hover:bg-slate-300"
                type="submit"
              />
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
};

const ChannelHeader = ({
  currentUserId,
  isOwner,
  channelId,
  channelName,
  privateMode,
  passwordProtected,
  setDeleteConfirmation,
  setLeaveConfirmation,
}: {
  currentUserId: number;
  isOwner: boolean;
  channelId: number;
  channelName: string | undefined;
  privateMode: boolean | undefined;
  passwordProtected: boolean | undefined;
  setDeleteConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  setLeaveConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="relative flex flex-col justify-center p-2">
      <div className="absolute top-1 right-1 flex">
        <LeaveIcon
          className="mt-1 w-8 self-center text-lg text-slate-500 hover:cursor-pointer hover:text-slate-700"
          onClick={() => {
            setLeaveConfirmation(true);
          }}
        />
      </div>
      <div className="mt-1 ml-1 flex w-full grow items-center">
        <div className="relative flex h-28 w-28 justify-center self-center border border-slate-400 bg-white">
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
        <div className="mx-4 flex h-full flex-col">
          <div className="text-left text-2xl font-bold">
            Channel : {channelName}
          </div>
          <div className="mt-2 flex flex-row ">
            <ChannelMode
              userId={currentUserId}
              channelId={channelId}
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
  currentUserId,
  channel,
  isAdmin,
  isOwner,
}: {
  currentUserId: number;
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
        currentUserId={currentUserId}
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
            currentUserId={currentUserId}
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
            currentUserId={currentUserId}
            key={index}
            channelId={channel.id}
            id={user.id}
            name={user.name}
            avatar={user.avatar}
            admin={false}
            owner={false}
            changesAuthorizedAsAdmin={isAdmin || isOwner}
            changesAuthorizedAsOwner={isOwner}
            muted={channel.muted?.some((u) => u.id === user.id)}
            banned={channel.banned?.some((u) => u.id === user.id)}
          />
        ) : null;
      })}
      <div className="ml-1 pt-5 text-left text-xl font-bold text-slate-700">
        BANNED USERS
      </div>
      {channel.banned.map((user, index) => (
        <UserBanner
          currentUserId={currentUserId}
          key={index}
          channelId={channel.id}
          id={user.id}
          name={user.name}
          avatar={user.avatar}
          admin={false}
          owner={false}
          changesAuthorizedAsAdmin={isAdmin || isOwner}
          changesAuthorizedAsOwner={isOwner}
          muted={false}
          banned={true}
        />
      ))}
      {channel.banned.length === 0 ? (
        <div className="mt-4 w-full text-center text-lg text-slate-300">
          No one is banned
        </div>
      ) : null}
    </div>
  );
};

/********************************************************************/
/*                        MAIN COMPONENT                            */
/********************************************************************/

export default function ChannelSettings() {
  const params = useParams();
  if (typeof params.channelId === "undefined") return <div>No channel Id</div>;
  const channelId = +params.channelId;

  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof channelSettingsLoader>
  >;
  const { data } = useQuery({ ...query(channelId), initialData });
  if (typeof data === "undefined") return <>Error</>;

  const isOwner = data?.user.id === data?.channel.owner.id;
  const isAdmin = data?.channel.admins.some(
    (admin) => admin.id === data.user.id
  )
    ? true
    : false;

  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [leaveConfirmation, setLeaveConfirmation] = useState(false);
  const [search, setSearch] = useState("");
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
              <div>{data?.channel.name}</div>
            </div>
          </HeaderCenterContent>
        </>
      </Header>
      <div className="relative flex h-full w-full flex-col ">
        {deleteConfirmation ? (
          <DeletePopUp
            channelId={channelId}
            userId={data.user.id}
            setConfirmation={setDeleteConfirmation}
          />
        ) : leaveConfirmation ? (
          <LeaveChannelPopUp
            channelId={channelId}
            userId={data.user.id}
            setConfirmation={setLeaveConfirmation}
          />
        ) : (
          ""
        )}
        <div
          className={`${
            deleteConfirmation || leaveConfirmation ? "blur-sm" : ""
          } flex h-full w-full flex-col`}
        >
          <ChannelHeader
            currentUserId={data.user.id}
            isOwner={isOwner}
            channelId={data.channel.id}
            channelName={data.channel.name}
            privateMode={data.channel.private}
            passwordProtected={data.channel.passwordProtected}
            setDeleteConfirmation={setDeleteConfirmation}
            setLeaveConfirmation={setLeaveConfirmation}
          />
          <MemberList
            currentUserId={data.user.id}
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
                  userId={data.user.id}
                  search={search}
                  queryData={data}
                  channelId={data?.channel.id ? data?.channel.id : 0}
                />
              ) : (
                <></>
              )}
              <SearchBar search={search} setSearch={setSearch} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
