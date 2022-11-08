import { useNavigate, useParams } from "react-router-dom";
import { useChannelSettingsQuery } from "../../graphql/generated";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as TrashIcon } from "pixelarticons/svg/trash.svg";
import { ReactComponent as MuteIcon } from "pixelarticons/svg/volume-x.svg";
import { ReactComponent as UnmuteIcon } from "pixelarticons/svg/volume.svg";
import { ReactComponent as UnbanIcon } from "pixelarticons/svg/user.svg";
import { ReactComponent as AddMemberIcon } from "pixelarticons/svg/user-plus.svg";
import { ReactComponent as BanIcon } from "pixelarticons/svg/user-x.svg";
import { ReactComponent as AdminIcon } from "pixelarticons/svg/briefcase-plus.svg";
import { useState } from "react";

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
          ? `border-slate-300 bg-slate-200 text-lg font-bold text-black ${
              owner ? "hover:cursor-pointer hover:bg-slate-300" : ""
            }`
          : `border-slate-200 bg-slate-50 text-slate-400 ${
              owner ? "hover:cursor-pointer hover:bg-slate-200" : ""
            }`
      } flex h-24 w-24 items-center justify-center rounded-full border-2 text-center`}
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
}: {
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
  const [adm, setAdm] = useState(admin); //TODO : remove this when mutation ok
  const navigate = useNavigate();
  const [showInfoAdmin, setShowInfoAdmin] = useState(false); //DON'T TOUCH
  const [showInfoMute, setShowInfoMute] = useState(false); //DON'T TOUCH
  const [showInfoBan, setShowInfoBan] = useState(false); //DON'T TOUCH
  const [showTimeMute, setShowTimeMute] = useState(false); //DON'T TOUCH
  const [showTimeBan, setShowTimeBan] = useState(false); //DON'T TOUCH
  return (
    <>
      <div className="flex h-full w-full shrink-0 items-end justify-center pr-2 transition-all hover:bg-slate-100 hover:shadow-sm">
        <div
          className="flex grow hover:cursor-pointer"
          onClick={() => navigate(`/profile/${id}`)}
        >
          <img
            src={avatar}
            alt="Owner avatar"
            className="m-1 h-12 w-12 rounded-full"
          />
          <div className="ml-2 flex flex-col justify-center text-xs">
            <div className="flex">
              <span className="truncate text-base font-bold ">{name}</span>
              <div className="mx-2 flex shrink-0">
                {ban ? <BanIcon className="w-4 text-red-600" /> : null}
                {mute ? <MuteIcon className="w-4 text-red-300" /> : null}
              </div>
            </div>
            <div className="text-xs">
              {owner ? "Owner" : adm ? "Admin" : "Member"}
            </div>
          </div>
        </div>
        <div className="flex justify-center self-center">
          {changesAuthorized && !adm && !owner ? (
            <div
              className="relative flex w-8 flex-col items-center justify-start"
              onClick={() => {
                setAdm(!adm); //TODO : MUTATION
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
                      setMute(!mute); //MUTATION
                  }}
                >
                  1h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeMute(false), //DONT TOUCH
                      setMute(!mute); //MUTATION
                  }}
                >
                  8h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeMute(false), //DONT TOUCH
                      setMute(!mute); //MUTATION
                  }}
                >
                  24h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeMute(false), //DONT TOUCH
                      setMute(!mute); //MUTATION
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
                      setBan(!ban); //MUTATION
                  }}
                >
                  1h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false), //don't touch
                      setBan(!ban); //MUTATION
                  }}
                >
                  8h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false), //don't touch
                      setBan(!ban); //MUTATION
                  }}
                >
                  24h
                </div>
                <div
                  className="hover:bg-slate-300"
                  onClick={() => {
                    setShowTimeBan(false), //don't touch
                      setBan(!ban); //MUTATION
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
                {" "}
                {ban ? (
                  <UnbanIcon
                    onMouseOver={() => setShowInfoBan(true)}
                    onMouseOut={() => setShowInfoBan(false)}
                    className="w-6 border-2 border-slate-300  text-neutral-600 hover:cursor-pointer hover:border-slate-700 hover:text-black"
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

//TODO : object destructuring
export default function ChannelSettings() {
  const params = useParams();
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
  const owner = data?.user.id === data?.channel.owner.id ? true : false;

  return (
    <div className="flex w-full flex-col ">
      <div className="relative flex flex-col justify-center bg-slate-200">
        {owner ? (
          <div
            className="absolute right-1 top-1 flex w-fit justify-center self-center rounded-md p-3 text-center text-lg text-slate-500 hover:cursor-pointer hover:text-slate-700"
            onClick={() => {
              alert("Delete the channel ?"); //replace with confirmation ?
              console.log("Delete channel"); // TODO : MUTATION
            }}
          >
            <TrashIcon className="w-8 -translate-y-0.5" />
          </div>
        ) : (
          <div></div>
        )}
        <div className="mt-4 flex h-24 w-24 justify-center self-center rounded-full  bg-black text-white">
          <UsersIcon className="mt-1 h-20 w-20 self-center" />
        </div>
        <div className="mt-2 mb-4 w-full text-center text-2xl font-bold">
          {data?.channel.name}
        </div>
      </div>
      <div className="my-10 flex justify-evenly">
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
        <div className="ml-2 mb-5 flex items-end justify-start">
          <div>Change Password : </div>
          <textarea className="w-46 mx-2 h-7 resize-none rounded-sm" />
          <input
            className="h-7 rounded-md border-2 bg-slate-100 p-1 hover:cursor-pointer hover:bg-slate-100"
            type="submit"
          />
        </div>
      ) : (
        <div></div>
      )}
      <div className=" mb-2 bg-slate-100 p-3 text-center text-xl font-bold text-slate-700">
        MEMBERS
      </div>

      <UserBanner
        id={data?.channel.owner.id}
        name={data?.channel.owner.name}
        avatar={data?.channel.owner.avatar}
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
        <div
          onClick={() => {
            console.log("ADD MEMBER"); //TO DO :  SEARCH USER TO ADD
          }}
          className="mt-4 flex w-fit items-center self-center rounded-md border-2 bg-slate-100 px-2 text-slate-600 hover:cursor-pointer hover:border-slate-300 hover:bg-slate-200 hover:text-black"
        >
          <AddMemberIcon className="w-8 " />
          <div className="mx-4 my-2 text-base">Add member</div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
