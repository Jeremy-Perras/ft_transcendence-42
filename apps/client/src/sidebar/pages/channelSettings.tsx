import { useNavigate, useParams } from "react-router-dom";
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
import { useQueryClient } from "@tanstack/react-query";

import { useThrottledState } from "@react-hookz/web";
import * as Avatar from "@radix-ui/react-avatar";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { useForm } from "react-hook-form";
import { HeaderPortal } from "../layout";

/*************************** WORKS AS INTENTED *************** */

/********************************************************************/
/*           CHANNEL TYPE / Password protected CHANGE               */
/********************************************************************/
const ChannelType = ({
  idChannel,
  activeMode,
  changesAuthorized,
}: {
  idChannel: number;
  activeMode: string;
  changesAuthorized: boolean;
}) => {
  const queryClient = useQueryClient();
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

/********************************************************************/
/*                        USER BANNERS                              */
/********************************************************************/
//TODO :  simplify this horrific thing
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
  const navigate = useNavigate();
  const [showInfoAdmin, setShowInfoAdmin] = useState(false);
  const [showInfoMute, setShowInfoMute] = useState(false);
  const [showInfoBan, setShowInfoBan] = useState(false);
  const [showTimeMute, setShowTimeMute] = useState(false);
  const [showTimeBan, setShowTimeBan] = useState(false);
  const queryClient = useQueryClient();

  const updateAdmins = useUpdateAdminsMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
  const bannedSomeone = useBannedSomeoneChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
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
  const deleteBannedSomeone = useDeleteBannedMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
  return (
    <>
      <div className="flex w-full shrink-0 items-end justify-center pr-2 transition-all hover:bg-slate-100 ">
        <div
          className="flex grow hover:cursor-pointer"
          onClick={() => navigate(`/profile/${id}`)}
        >
          {typeof avatar !== undefined && avatar !== "" ? (
            <img
              src={avatar}
              alt="Player avatar"
              className="mt-1 h-12 w-12 border border-black"
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
        <div className="flex justify-center self-center">
          {changesAuthorizedAsOwner && !admin && !owner ? (
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
          ) : (
            <div></div>
          )}
          {(admin && changesAuthorizedAsOwner) ||
          (!admin && changesAuthorizedAsAdmin) ? (
            <div className="relative flex w-8 flex-col text-center transition-all hover:cursor-pointer">
              <div
                onMouseLeave={() => setShowTimeMute(false)}
                className={`${
                  showTimeMute
                    ? "visible h-fit w-10 border-2 opacity-100"
                    : "hidden h-0 w-0 opacity-0"
                } absolute -left-1 -top-5 z-10 flex-col border-slate-300 bg-slate-200 text-center text-xs text-slate-700 transition-all`}
              >
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeMute(false),
                      mutedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date:
                          Math.floor(new Date() as unknown as number) +
                          60 * 60 * 2 * 1000,
                      });
                  }}
                >
                  1h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeMute(false),
                      mutedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date:
                          Math.floor(new Date() as unknown as number) +
                          60 * 60 * 9 * 1000,
                      });
                  }}
                >
                  8h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeMute(false),
                      mutedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date:
                          Math.floor(new Date() as unknown as number) +
                          60 * 60 * 25 * 1000,
                      });
                  }}
                >
                  24h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeMute(false), //DONT TOUCH
                      mutedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date: null,
                      });
                  }}
                >
                  Forever
                </div>
              </div>
              <div
                className="flex flex-col items-center justify-center"
                onClick={() => {
                  !muted ? setShowTimeMute(true) : "";
                }}
              >
                {" "}
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
          ) : (
            <div></div>
          )}
          {(admin && changesAuthorizedAsOwner) ||
          (!admin && changesAuthorizedAsAdmin) ? (
            <div className="relative flex w-8 flex-col justify-end text-center transition-all hover:cursor-pointer">
              <div
                onMouseLeave={() => setShowTimeBan(false)}
                className={`${
                  showTimeBan
                    ? "visible h-fit w-10 border-2 opacity-100"
                    : "hidden h-0 w-0 opacity-0"
                } absolute -left-1 -top-5 z-10 flex-col border-slate-300 bg-slate-200 text-center text-xs text-slate-700 transition-all`}
              >
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false),
                      bannedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date:
                          Math.floor(new Date() as unknown as number) +
                          60 * 60 * 1000 * 2,
                      });
                  }}
                >
                  1h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false),
                      bannedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date:
                          Math.floor(new Date() as unknown as number) +
                          60 * 60 * 9 * 1000,
                      });
                  }}
                >
                  8h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false),
                      bannedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date:
                          Math.floor(new Date() as unknown as number) +
                          60 * 60 * 25 * 1000,
                      });
                  }}
                >
                  24h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false),
                      bannedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date: null,
                      });
                  }}
                >
                  Forever
                </div>
              </div>
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
export const SearchBar = ({
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
    <div className="relative flex grow border-t-2 bg-slate-100">
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
      <div className="absolute inset-y-0 right-2 flex items-center">
        {search.length > 0 ? (
          <button onClick={resetSearch}>
            <CloseIcon className="h-6 text-slate-400" />
          </button>
        ) : (
          <SearchIcon className="h-6 text-slate-400" />
        )}
      </div>
    </div>
  );
};
const Search = ({
  search,
  setSearch,
  queryData,
  channelId,
}: {
  search: string;
  setSearch: (value: string) => void;
  queryData: ChannelSettingsQuery;
  channelId: number;
}) => {
  const queryClient = useQueryClient();
  const { data } = useSearchUsersChannelsQuery(
    { name: search },
    {
      select(data) {
        const { users, channels } = data;
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
    <div className="relative flex flex-col divide-y divide-slate-200">
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
/*                                POPUP                             */
/********************************************************************/
const DeletePopUp = ({
  channelId,
  confirmation,
  setConfirmation,
}: {
  channelId: number;
  confirmation: boolean;
  setConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteChannel = useDeleteChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
  //TODO : fix issue close when click on window
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
/*                        MAIN COMPONENT                            */
/********************************************************************/
//TODO : object destructuring
export default function ChannelSettings() {
  const [search, setSearch] = useThrottledState("", 500);
  const params = useParams();

  const [confirmation, setConfirmation] = useState(false);
  // TODO Slow to reload data when invalidate only the Queries

  if (typeof params.channelId === "undefined") return <div></div>;
  const channelId = +params.channelId;
  const { isLoading, data, error, isFetching } = useChannelSettingsQuery({
    userId: null,
    channelId: channelId,
  });

  if (isLoading) return <div>Loading ...</div>;
  if (isFetching) {
    return <div>Fetching</div>;
  }
  if (error) {
    return <div>Error</div>;
  }
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
        text="Settings"
        link=""
        icon=""
      />
      <div className="relative flex h-full w-full flex-col ">
        {confirmation ? (
          <DeletePopUp
            channelId={channelId}
            confirmation={confirmation}
            setConfirmation={setConfirmation}
          />
        ) : (
          ""
        )}
        <div className={`${confirmation ? "blur-sm" : ""} `}>
          {/* TODO : put this in a component */}
          <div className="relative flex flex-col justify-center p-2">
            {isOwner ? (
              <div
                className="absolute right-1 top-1 flex w-fit justify-center self-center p-3 text-center text-lg text-slate-500 hover:cursor-pointer hover:text-slate-700"
                onClick={() => {
                  setConfirmation(true);
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
                  Channel : {data?.channel.name}
                </div>
                <div className="mt-2 flex flex-row ">
                  <ChannelType
                    idChannel={data?.channel.id ? data.channel.id : 0}
                    activeMode={
                      data?.channel.private
                        ? "Private"
                        : data?.channel.passwordProtected
                        ? "Password protected"
                        : "Public"
                    }
                    changesAuthorized={isOwner}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* TODO : put this in a component */}

          <div className="ml-1 pt-5 text-left text-xl font-bold text-slate-700">
            MEMBERS
          </div>
          <UserBanner
            id={data?.channel.owner.id}
            name={data?.channel.owner.name}
            avatar={data?.channel.owner.avatar}
            channelId={data?.channel.id}
            admin={false}
            owner={true}
            changesAuthorizedAsAdmin={false}
            changesAuthorizedAsOwner={false}
            muted={false}
            banned={false}
          />
          {data?.channel.admins.map((user, index) => {
            return !(user.id === data?.channel.owner.id) ? (
              <UserBanner
                key={index}
                channelId={data?.channel.id}
                id={user.id}
                name={user.name}
                avatar={user.avatar}
                admin={true}
                owner={false}
                changesAuthorizedAsAdmin={isAdmin}
                changesAuthorizedAsOwner={isOwner}
                muted={data?.channel.muted.some((u) => u.id === user.id)}
                banned={data?.channel.banned.some((u) => u.id === user.id)}
              />
            ) : null;
          })}
          {data?.channel.members.map((user, index) => {
            return !data?.channel.admins.some(
              (admin) => admin.id === user.id
            ) ? (
              <UserBanner
                key={index}
                channelId={data?.channel.id}
                id={user.id}
                name={user.name}
                avatar={user.avatar}
                admin={false}
                owner={false}
                changesAuthorizedAsAdmin={isAdmin}
                changesAuthorizedAsOwner={isOwner}
                muted={data?.channel.muted.some((u) => u.id === user.id)}
                banned={data?.channel.banned.some((u) => u.id === user.id)}
              />
            ) : null;
          })}
          {isOwner || isAdmin ? (
            <>
              <div className="mt-5 flex flex-col">
                <SearchBar search={search} setSearch={setSearch} />
                {search.length === 0 ? (
                  ""
                ) : data ? (
                  <Search
                    search={search}
                    setSearch={setSearch}
                    queryData={data}
                    channelId={data?.channel.id ? data?.channel.id : 0}
                  />
                ) : (
                  <></>
                )}
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
