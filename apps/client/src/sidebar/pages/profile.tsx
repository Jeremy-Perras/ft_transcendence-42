import { Link, useParams } from "react-router-dom";
import { useGetUserProfileHeaderQuery } from "../../graphql/generated";

const DisplayUserProfile = () => {
  const params = useParams();
  if (typeof params.userId === "undefined") return <div></div>;
  const userId = +params.userId;
  const { isLoading, data, error, isFetching } = useGetUserProfileHeaderQuery({
    userId: userId,
  });
  if (isLoading) return <div>Loading ...</div>;

  if (isFetching) {
    return <div>Fetching</div>;
  }

  if (error) {
    return <div>Error</div>;
  }
  return (
    <div className="text-md mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600">
      <img className="m-2 h-20 w-20 object-cover" src={data?.user.avatar} />
      <div className=" text-slate-800">{data?.user.name}</div>
      <div className="">Rank : {data?.user.rank}</div>

      <div className=" m-2 w-full flex-col  border-black text-sm"></div>
    </div>
  );
  // }
};

export default function Profile() {
  return <DisplayUserProfile />;
}
