import { Link, useParams } from "react-router-dom";

const DisplayUserProfile = () => {
  const params = useParams();

  // const { isLoading, error, data, isFetching } = useQuery([
  //   "users",
  //   params.userId,
  // ]);

  // if (isLoading) return <div>Loading ...</div>;
  // if (isFetching) {
  //   console.warn("Fetching");
  //   return <div>Fetching</div>;
  // }
  // if (error) {
  //   console.log("Error");
  //   return <div>Error</div>;
  // } else {
  return (
    <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600">
      <div className="text-md justify-center text-slate-800">
        {params.userId} profile{" "}
      </div>
      <img
        className="m-2 h-20 w-20 object-cover"
        src={`https://i.pravatar.cc/300?img=5`}
      />
      <div className=" m-2 w-full flex-col  border-black text-sm">
        {/* <div>Id: {data.id}</div>
          <div>Name: {data.name}</div>
          <div>Rank: {data.rank}</div> */}
      </div>
    </div>
  );
  // }
};

export default function Profile() {
  return (
    <div>
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
      <DisplayUserProfile />
    </div>
  );
}
