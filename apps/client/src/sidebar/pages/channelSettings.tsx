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
  return (
    <div className="flex flex-col">
      <UsersIcon className="h-20 w-20 self-center" />
      <div className="mt-2 w-full text-center text-2xl font-bold">
        {data?.channel.name}
      </div>
      <div>Type</div>
      <div className="flex">
        <div>Owner</div>
        <img
          src={data?.channel.owner.avatar}
          alt="Owner avatar"
          className="h-10 w-10 rounded-full"
        />
        <div>{data?.channel.owner.name}</div>
      </div>
      <div>Admins</div>
      <div>Membres + nb mb</div>
      <div>Si admin : add someone / Mute ? Block</div>
      <div>Si owner : Delete</div>
    </div>
  );
}
