import { Link, useParams } from "react-router-dom";

const DisplayUserProfile = () => {
  const params = useParams();

  return (
    <div className="mb-2 mt-2 flex w-full flex-col border-t-2 border-slate-600">
      <div className="text-md justify-center text-slate-800">
        {params.userId} profile{" "}
      </div>
      <img
        className="m-2 h-20 w-20 object-cover"
        src={`https://i.pravatar.cc/300?img=5`}
      />
      <div className=" m-2 w-full flex-col  border-black text-sm"></div>
    </div>
  );
  // }
};

export default function Profile() {
  return <DisplayUserProfile />;
}
