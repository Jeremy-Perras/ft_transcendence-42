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

/********************************************************************/
/*                      CHANNEL TYPE BUTTONS                        */
/********************************************************************/
const ChannelTypeButton = ({
  text,
  owner,
  activeMode,
}: {
  text: string;
  owner: boolean;
  activeMode: boolean | undefined; //TODO :CHECK IN BACK => should not be undefined
}) => {
  return (
    <div
      className={`${
        activeMode
          ? `bg-slate-200 text-lg font-bold text-black ${
              owner ? "hover:cursor-pointer hover:bg-slate-300" : ""
            }`
          : `bg-slate-50 text-slate-400 ${
              owner ? "hover:cursor-pointer hover:bg-slate-200" : ""
            }`
      } flex h-24 basis-1/3 items-center justify-center border-y-2 border-l-2 border-slate-300 text-center text-xl`}
      onClick={
        owner
          ? () => {
              console.log("Change mode");
              // mutation
            }
          : () => {
              console.log("Unauthorized");
            }
      }
    >
      {text}
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
  changesAuthorized,
  channelId,
}: {
  channelId: number | undefined;
  id: number | undefined; //TODO: CHECK IN BACK => should not be undefined
  name: string | undefined; //TODO: CHECK IN BACK
  avatar: string | undefined; //TODO: CHECK IN BACK
  admin: boolean;
  owner: boolean;
  muted: boolean | undefined;
  banned: boolean | undefined;
  changesAuthorized: boolean;
}) => {
  const [mute, setMute] = useState(muted); //TODO : remove this when mutation ok
  const [ban, setBan] = useState(banned); //TODO : remove this when mutation ok
  const navigate = useNavigate();
  const [showInfoAdmin, setShowInfoAdmin] = useState(false); //DON'T TOUCH
  const [showInfoMute, setShowInfoMute] = useState(false); //DON'T TOUCH
  const [showInfoBan, setShowInfoBan] = useState(false); //DON'T TOUCH
  const [showTimeMute, setShowTimeMute] = useState(false); //DON'T TOUCH
  const [showTimeBan, setShowTimeBan] = useState(false); //DON'T TOUCH
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
      <div className="flex h-full w-full shrink-0 items-end justify-center pr-2 transition-all hover:bg-slate-100 ">
        <div
          className="flex grow hover:cursor-pointer"
          onClick={() => navigate(`/profile/${id}`)}
        >
          <img src={avatar} alt="Owner avatar" className="m-1 h-12 w-12 " />
          <div className="ml-2 flex flex-col justify-center text-xs">
            <div className="flex">
              <span className="truncate text-base font-bold ">{name}</span>
              <div className="mx-2 flex shrink-0">
                {ban ? <BanIcon className="w-4 text-red-600" /> : null}
                {mute ? <MuteIcon className="w-4 text-red-300" /> : null}
              </div>
            </div>
            <div className="text-xs">
              {owner ? "Owner" : admin ? "Admin" : "Member"}
            </div>
          </div>
        </div>
        <div className="flex justify-center self-center">
          {changesAuthorized && !admin && !owner ? (
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
          {changesAuthorized ? (
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
                    setShowTimeMute(false), //DONT TOUCH
                      mutedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date: Math.floor(new Date()) + 60 * 60 * 2 * 1000,
                      });
                  }}
                >
                  1h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeMute(false), //DONT TOUCH
                      mutedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date: Math.floor(new Date()) + 60 * 60 * 9 * 1000,
                      });
                  }}
                >
                  8h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeMute(false), //DONT TOUCH
                      mutedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date: Math.floor(new Date()) + 60 * 60 * 25 * 1000,
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
                  !mute ? setShowTimeMute(true) : setMute(!mute); //change setMute with mutation - dont touch set show time
                }}
              >
                {" "}
                {mute ? (
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
                    onClick={() => setShowTimeMute(true)} //DONT TOUCH
                    className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
                  />
                )}
                <div
                  className={`${
                    showInfoMute ? "opacity-100" : "opacity-0 "
                  } absolute top-6 w-24 text-center text-xs text-slate-400`}
                >
                  {mute ? "Unmute" : "Mute"}
                </div>
              </div>
            </div>
          ) : (
            <div></div>
          )}
          {changesAuthorized ? (
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
                    setShowTimeBan(false), //DONT TOUCH
                      bannedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date: Math.floor(new Date()) + 60 * 60 * 1000 * 2,
                      });
                  }}
                >
                  1h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false), //don't touch
                      bannedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date: Math.floor(new Date()) + 60 * 60 * 9 * 1000,
                      });
                  }}
                >
                  8h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false), //don't touch
                      bannedSomeone.mutate({
                        channelId: channelId ? channelId : 0,
                        createMutedId: id ? id : 0,
                        date: Math.floor(new Date()) + 60 * 60 * 25 * 1000,
                      });
                  }}
                >
                  24h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false), //don't touch
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
                onClick={
                  () =>
                    !ban
                      ? setShowTimeBan(true) //DONT TOUCH
                      : setBan(!ban) //MUTATION
                }
              >
                {ban ? (
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
                  {ban ? "Unban" : "Ban"}
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
}: {
  search: string;
  setSearch: (value: string) => void;
  queryData: ChannelSettingsQuery;
}) => {
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
  return (
    <div className="relative flex flex-col divide-y divide-slate-200">
      {data?.map((result, index) => (
        <div>
          {!queryData.channel.members.some((u) => u.id === result?.id) &&
          !queryData.channel.admins.some((u) => u.id === result?.id) ? (
            <div
              key={index}
              className="flex items-center p-2 even:bg-white hover:cursor-pointer hover:bg-blue-100"
            >
              <>
                <Avatar.Root>
                  <Avatar.Image
                    className="h-10 w-10 object-cover "
                    src={result?.avatar}
                  />
                  <Avatar.Fallback>
                    <UserIcon className="h-10 w-10" />
                  </Avatar.Fallback>
                </Avatar.Root>
                <Highlight content={result.name} search={search} />
                <AddMemberIcon
                  className="absolute right-0 w-8"
                  onClick={() => {
                    alert("TO DO : MUTATION"); //TODO :  MUTATION
                  }}
                />{" "}
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
/*                        MAIN COMPONENT                            */
/********************************************************************/
//TODO : object destructuring
export default function ChannelSettings() {
  const [search, setSearch] = useThrottledState("", 500);
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState(false);
  // TODO Slow to reload data when invalidate only the Queries
  const deleteChannel = useDeleteChannelMutation({
    onSuccess: () => {
      queryClient.invalidateQueries([
        // "ChannelSettings",
        // { userId: null, channelId: channelId },
      ]);
    },
  });
  if (typeof params.channelId === "undefined") return <div></div>;
  console.log(params);
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
  const owner = data?.user.id === data?.channel.owner.id ? true : false;
  console.log(Math.floor(new Date() / 1000));
  return (
    <div className="flex w-full flex-col ">
      {confirmation ? (
        <div
          className=" absolute top-0 right-0 z-10 flex h-full w-full bg-white"
          onClick={() => setConfirmation(false)}
        >
          <div className="relative flex items-center justify-center bg-white">
            <div className="flex flex-col items-center">
              <div className=" mt-4  text-center">
                <p className="font-bold">Delete your Channel</p>
                <p className="mt-1 text-sm text-gray-700">
                  You will lose all of your data by deleting your Channel. This
                  action cannot be undone.
                </p>
              </div>

              <div className="mt-4 flex flex-row text-center">
                <button
                  onClick={() => {
                    deleteChannel.mutate({ channelId: channelId });
                    navigate("/");
                  }}
                  className="block w-full  bg-gray-200 px-4 py-3 text-sm font-semibold text-red-700 "
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmation(false)}
                  className="ml-2 block w-full bg-gray-200 px-4 py-3 text-sm font-semibold "
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="relative flex flex-col justify-center bg-slate-100">
        {owner ? (
          <div
            className="absolute right-1 top-1 flex w-fit justify-center self-center  p-3 text-center text-lg text-slate-500 hover:cursor-pointer hover:text-slate-700"
            onClick={() => {
              setConfirmation(true);
            }}
          >
            <TrashIcon className="w-8 -translate-y-0.5" />
          </div>
        ) : (
          <div></div>
        )}
        <div className="mt-4 flex h-24 w-24 justify-center self-center  bg-black text-white">
          <UsersIcon className="mt-1 h-20 w-20 self-center" />
        </div>
        <div className="mt-2 mb-4 w-full text-center text-2xl font-bold">
          {data?.channel.name}
        </div>
      </div>
      <div className="flex flex-col bg-slate-100 ">
        <div className="flex border-r-2 border-slate-300">
          <ChannelTypeButton
            text="Public"
            owner={owner}
            activeMode={
              !data?.channel.passwordProtected && !data?.channel.private
            }
          />
          <ChannelTypeButton
            text="Private"
            owner={owner}
            activeMode={data?.channel.private}
          />

          <ChannelTypeButton
            text="Password protected"
            owner={owner}
            activeMode={data?.channel.passwordProtected}
          />
        </div>
        {data?.channel.passwordProtected && owner ? (
          <div className="ml-2 mb-5 flex flex-col items-center justify-center">
            <div className="mb-4 flex">
              <div>Change Password : </div>
              <textarea className="w-46 mx-2 h-7 resize-none " />
            </div>
            <input
              className=" border-2 border-slate-300 bg-slate-200 px-3 py-2 hover:cursor-pointer hover:bg-slate-300"
              type="submit"
            />
          </div>
        ) : (
          <div></div>
        )}
      </div>

      <div className="p-5 text-center text-xl font-bold text-slate-700">
        MEMBERS
      </div>

      <UserBanner
        id={data?.channel.owner.id}
        name={data?.channel.owner.name}
        avatar={data?.channel.owner.avatar}
        channelId={data?.channel.id}
        admin={false}
        owner={true}
        changesAuthorized={false}
        muted={data?.channel.muted.some(
          (user) => user.id === data?.channel.owner.id
        )}
        banned={data?.channel.banned.some(
          (user) => user.id === data?.channel.owner.id
        )}
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
            changesAuthorized={owner}
            muted={data?.channel.muted.some((u) => u.id === user.id)}
            banned={data?.channel.banned.some((u) => u.id === user.id)}
          />
        ) : null;
      })}
      {data?.channel.members.map((user, index) => {
        return !data?.channel.admins.some((admin) => admin.id === user.id) ? (
          <UserBanner
            key={index}
            channelId={data?.channel.id}
            id={user.id}
            name={user.name}
            avatar={user.avatar}
            admin={false}
            owner={false}
            changesAuthorized={
              owner ||
              data?.channel.admins.some((admin) => admin.id === user.id)
            }
            muted={data?.channel.muted.some((u) => u.id === user.id)}
            banned={data?.channel.banned.some((u) => u.id === user.id)}
          />
        ) : null;
      })}
      {data?.channel.admins.some((admin) => admin.id === data?.user.id) ? (
        <>
          <div className="mt-5 flex flex-col">
            <SearchBar search={search} setSearch={setSearch} />
            {search.length === 0 ? (
              ""
            ) : (
              <Search search={search} setSearch={setSearch} queryData={data} />
            )}
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
