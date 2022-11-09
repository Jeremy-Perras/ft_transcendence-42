import { useNavigate, useParams } from "react-router-dom";
import { useChannelSettingsQuery } from "../../graphql/generated";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as TrashIcon } from "pixelarticons/svg/trash.svg";
import { ReactComponent as MuteIcon } from "pixelarticons/svg/volume-x.svg";
import { ReactComponent as UnmuteIcon } from "pixelarticons/svg/volume.svg";
import { ReactComponent as UnbanIcon } from "pixelarticons/svg/user-plus.svg";
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
  return (
    <>
      <div className="flex h-full w-full shrink-0 items-center justify-between transition-all hover:bg-slate-100">
        <div
          className="flex grow hover:cursor-pointer"
          onClick={() => navigate(`/profile/${id}`)}
        >
          <img
            src={avatar}
            alt="Owner avatar"
            className="m-1 h-12 w-12 rounded-full"
          />
          <div className="flex flex-col justify-center text-xs">
            <div className="flex">
              <span className="truncate text-base font-bold ">{name}</span>
              <div className="mx-2 flex shrink-0">
                {mute ? <MuteIcon className="w-4 text-red-300" /> : null}
                {ban ? <BanIcon className="w-4 text-red-600" /> : null}
              </div>
            </div>
            <div className="text-xs">
              {owner ? "Owner" : adm ? "Admin" : "Member"}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          {changesAuthorized && !adm && !owner ? (
            <div
              className="flex w-20 shrink-0 flex-col items-center justify-end text-center text-xs text-neutral-600 transition-all hover:cursor-pointer hover:text-black"
              onClick={() => {
                setAdm(!adm);
                //TODO : mutation
                console.log("Set admin button");
              }}
            >
              {" "}
              <AdminIcon className="w-7" />
              <div>Set as admin</div>
            </div>
          ) : null}
          {changesAuthorized ? (
            <div className="flex shrink-0 text-xs">
              <div
                className={`${
                  mute
                    ? "text-slate-300 hover:text-slate-400"
                    : "font-bold text-neutral-600 hover:text-black"
                } mx-2 flex w-8 flex-col justify-end text-center transition-all hover:cursor-pointer`}
              >
                <div>
                  <div
                    onClick={() => {
                      setMute(!mute);
                      //TODO : mutation
                      console.log("Mute button");
                    }}
                  >
                    {" "}
                    {mute ? (
                      <UnmuteIcon className="w-7" />
                    ) : (
                      <MuteIcon className="w-7" />
                    )}
                    {mute ? "Unmute" : "Mute"}
                  </div>
                </div>
              </div>
              <div
                className={`${
                  ban
                    ? "text-slate-300 hover:text-slate-400"
                    : " font-bold text-neutral-600 hover:text-black"
                } mx-2 flex w-8 flex-col justify-end text-center transition-all hover:cursor-pointer`}
              >
                <div className="flex justify-center ">
                  <div
                    onClick={() => {
                      setBan(!ban);
                      //TODO : mutation
                      console.log("Ban button");
                    }}
                  >
                    {" "}
                    {ban ? (
                      <UnbanIcon className="w-6" />
                    ) : (
                      <BanIcon className="w-6 -translate-x-0.5" />
                    )}
                    {ban ? "Unban" : "Ban"}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
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

  // TODO : add bool for admin to authorize some changes (ban / mute)

  return (
    <div className="flex w-full flex-col ">
      <div className="mt-4 flex h-24 w-24 justify-center self-center rounded-full  bg-black text-white">
        <UsersIcon className="mt-1 h-20 w-20 self-center" />
      </div>
      <div className="mt-2 w-full text-center text-2xl font-bold">
        {data?.channel.name}
      </div>

      <div className="mt-10 flex justify-evenly">
        <div
          className={`${
            !data?.channel.passwordProtected && !data?.channel.private
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
                  // mutation
                }
              : () => {
                  return null;
                }
          }
        >
          Public
        </div>
        <div
          className={`${
            data?.channel.private
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
                  // mutation
                }
              : () => {
                  return null;
                }
          }
        >
          Private
        </div>
        <div
          className={`${
            data?.channel.passwordProtected
              ? `border-slate-300 bg-slate-200 text-lg font-bold text-black ${
                  owner ? "hover:cursor-pointer hover:bg-slate-300" : ""
                }`
              : `border-slate-200 bg-slate-50 text-slate-400 ${
                  owner ? "hover:cursor-pointer hover:bg-slate-200" : ""
                }`
          } flex h-24 w-24 items-center justify-center rounded-full border-2 text-center `}
          onClick={
            owner
              ? () => {
                  // mutation
                }
              : () => {
                  return null;
                }
          }
        >
          Password protected
        </div>
        {/* TODO : ACTIVE ON CLICK + MUTATION IF OWNER */}
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
      <div>CHANGE PW</div>
      <div>ADD AS ADMIN</div>
      <div>ADD MEMBER</div>
      <div>Mute limited time</div>
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
      {owner ? (
        <div
          className="mt-8 mb-2 flex w-fit justify-center self-center rounded-md bg-red-500 p-3 text-center text-lg text-white hover:cursor-pointer hover:bg-red-600"
          onClick={() => {
            console.log("Delete channel");
          }}
          // TODO : mutation to delete channel
        >
          <TrashIcon className="mr-2  w-6 -translate-y-0.5" />
          <div>Delete channel</div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
