import { Link, useParams } from "react-router-dom";

const DirectConversation = () => {
  const params = useParams();

  return (
    <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600">
      <div className="p-2 text-center">
        Conversation with user {params?.userId}
      </div>
    </div>
  );
  // }
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
