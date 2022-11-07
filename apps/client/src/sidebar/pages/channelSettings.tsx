import { useParams } from "react-router-dom";
import { useChannelSettingsQuery } from "../../graphql/generated";
import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";

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
  // TODO : Create element for type buttons
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
                  console.log("Change mode");
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
                  console.log("Change mode");
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
                  console.log("Change mode");
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
      <div className="mt-2 ml-2 flex items-center justify-start">
        <img
          src={data?.channel.owner.avatar}
          alt="Owner avatar"
          className=" mr-2 h-12 w-12 rounded-full"
        />
        <div className="flex flex-col justify-center text-xs">
          <div className="text-base font-bold"> Owner</div>
          <div>{data?.channel.owner.name}</div>
        </div>
      </div>
      <div>Admins</div>
      <div>Membres + nb mb</div>
      <div>Si admin : add someone / Mute ? Block</div>

      {owner ? (
        <div
          className="w-24 rounded-md bg-red-300 text-center hover:cursor-pointer hover:bg-red-400"
          onClick={() => {
            console.log("Delete channel");
          }}
          // TODO : mutation to delete channel
        >
          Delete
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
