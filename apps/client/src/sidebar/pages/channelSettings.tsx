import { useNavigate, useParams } from "react-router-dom";
import { useChannelSettingsQuery } from "../../graphql/generated";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as TrashIcon } from "pixelarticons/svg/trash.svg";
import { ReactComponent as MuteIcon } from "pixelarticons/svg/volume-x.svg";
import { ReactComponent as UnmuteIcon } from "pixelarticons/svg/volume.svg";
import { ReactComponent as UnbanIcon } from "pixelarticons/svg/user-plus.svg";
import { ReactComponent as BanIcon } from "pixelarticons/svg/user-x.svg";

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
  const navigate = useNavigate();
  return (
    <>
      <div
        className="mt-1 flex w-full items-center justify-between p-1 hover:cursor-pointer hover:bg-slate-100"
        onClick={() => navigate(`/profile/${id}`)}
      >
        <div className="flex grow">
          <img
            src={avatar}
            alt="Owner avatar"
            className="ml-2 mr-2 h-12 w-12 rounded-full"
          />
          <div className="flex flex-col justify-center text-xs">
            <div className="flex">
              <span className="truncate text-base font-bold ">{name}</span>
              <div className="mx-2 flex">
                {muted ? <MuteIcon className="w-4 text-red-300" /> : null}
                {banned ? <BanIcon className="w-4 text-red-600" /> : null}
              </div>
            </div>
            <div className="text-xs">
              {owner ? "Owner" : admin ? "Admin" : "Member"}
            </div>
          </div>
        </div>

        {changesAuthorized ? (
          <div className="mx-2 flex h-8 justify-center text-sm">
            <div
              className={`${
                muted
                  ? "bg-slate-200 hover:bg-slate-300 "
                  : "bg-orange-300 font-bold hover:bg-orange-400"
              } mx-2 flex w-12 items-center justify-center rounded-md`}
            >
              <div className="w-10 text-center">
                <div>{muted ? "Unmute" : "Mute"}</div>
              </div>
            </div>
            <div
              className={`${
                banned
                  ? "bg-slate-200 hover:bg-slate-300 "
                  : "bg-red-400 font-bold hover:bg-red-500"
              } mx-2 flex w-12 items-center justify-center rounded-md`}
            >
              <div className="w-10 text-center">
                <div>{banned ? "Unban" : "Ban"}</div>
              </div>
            </div>
          </div>
        ) : null}
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
      <div className="flex flex-col justify-center bg-slate-100">
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
      <div>CHANGE PW</div>
      <div>ADD AS ADMIN</div>
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
