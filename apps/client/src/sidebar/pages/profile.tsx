import { useParams } from "react-router-dom";
import {
  useGetInfoUsersQuery,
  useGetUserProfileQuery,
} from "../../graphql/generated";
import crown from "../../assets/images/king.png";
import loose from "../../assets/images/skull-and-bones.png";
import { ReactComponent as Arrow } from "pixelarticons/svg/arrow-down-box.svg";

const getInfoUser = () => {
  const { data } = useGetInfoUsersQuery();
  return data;
};
const DisplayUserProfile = () => {
  const params = useParams();
  const infos = getInfoUser();
  return (
    <>
      <div className=" m-2 flex flex-row items-center">
        <img src={infos?.user.avatar} className="h-20 w-20 rounded-full" />
        <span className="m-1 font-bold">Rank : {infos?.user.rank}</span>
      </div>
      <div className=" flex w-full justify-items-end border-4">
        <Arrow className="flex h-10 w-10" />
      </div>

      <ul className="flex flex-col items-center justify-center">
        {infos?.user.games.map((g, index) => (
          <li key={index} className="m-2 flex flex-row">
            <img
              src={`${
                g.player1.id == +params?.userId
                  ? g.player2.avatar
                  : g.player1.avatar
              }`}
              alt="opponent picture"
              className="m-1 h-10 w-10 rounded-full"
            />

            <img
              src={`${
                g.player1.id == +params?.userId
                  ? g.player1score > g.player2score
                    ? crown
                    : loose
                  : g.player2score > g.player1score
                  ? crown
                  : loose
              }`}
              alt="opponent picture"
              className="m-1 h-10 w-10 rounded-full"
            />
          </li>
        ))}
      </ul>
    </>
  );
};

export default function Profile() {
  return <DisplayUserProfile />;
}
