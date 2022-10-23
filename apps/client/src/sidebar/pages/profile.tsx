import { Link } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

import { UserSchema } from "@shared/schemas";

// TODO: diplay other users profile
let queryClient = new QueryClient();

async function getProfile(url: string) {
  try {
    const response = await fetch(url);
    if (response.status === 200) {
      const json = await response.json();
      return json;
    } else throw Error("Not 200!!");
  } catch (error) {
    console.log(error);
  }
}

const DisplayMyProfile = () => {
  const { isLoading, error, data, isFetching } = useQuery(["repoData"], () =>
    getProfile("http://localhost:3000/api/users/me")
  );

  if (isLoading) return <div>Loading ...</div>;
  if (isFetching) {
    console.warn("Fetching");
    return <div>Fetching</div>;
  }
  if (error) {
    console.log("Error");
    return <div>Error</div>;
  } else {
    const user = UserSchema.parse(data);
    return (
      <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600">
        <div className="text-md justify-center text-slate-800">
          {" "}
          My profile{" "}
        </div>
        <img
          className="m-2 h-20 w-20 object-cover"
          src={`https://i.pravatar.cc/300?img=5`}
        />
        <div className=" m-2 w-full flex-col  border-black text-sm">
          <div>Id: {user.id}</div>
          <div>Name: {user.name}</div>
          <div>Rank: {user.rank}</div>
        </div>
      </div>
    );
  }
};

export default function Profile() {
  return (
    <QueryClientProvider client={queryClient}>
      <h1 className="text-lg">profile</h1>
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
      <DisplayMyProfile />
    </QueryClientProvider>
  );
}
