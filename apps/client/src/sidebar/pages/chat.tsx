import { Link, useParams } from "react-router-dom";
import { useDirectMessagesQuery } from "../../graphql/generated";

const DirectConversation = () => {
  const params = useParams();
  const { isLoading, data, error, isFetching } = useDirectMessagesQuery({
    userId: +params.userId,
  });
  console.log(data);
  if (isLoading) return <div>Loading ...</div>;
  if (isFetching) {
    return <div>Fetching</div>;
  }
  if (error) {
    return <div>Error</div>;
  } else {
    return (
      <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600">
        <div className="p-2 text-center">
          Conversation with user {params?.userId}
        </div>
        {data?.user.messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.author.id === +params.userId
                ? "bg-red-500 text-right"
                : "bg-blue-300 text-left"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
    );
  }
};
export default function Chat() {
  return (
    <div>
      <h1 className="text-lg">chat</h1>
      <ul>
        <li>
          <Link to="/">list</Link>
        </li>
        <li>
          <Link to="/channel/test">channel</Link>
        </li>
        <li>
          <Link to="/chat/test">chat</Link>
        </li>
        <li>
          <Link to="/profile/user">profile</Link>
        </li>
      </ul>
      <DirectConversation />
    </div>
  );
}
