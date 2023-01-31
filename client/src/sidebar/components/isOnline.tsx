import { UserStatus } from "../../../src/gql/graphql";

export const IsOnline = ({ userStatus }: { userStatus: UserStatus }) => {
  return userStatus === UserStatus.Online ? (
    <span className="absolute top-0 left-0 flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full  bg-green-500"></span>
    </span>
  ) : UserStatus.Offline ? (
    <span className={`absolute top-0 left-0 flex h-2 w-2`}>
      <span className="absolute inline-flex h-full w-full bg-red-500 "></span>
    </span>
  ) : (
    <span className={`absolute top-0 left-0 flex h-2 w-2`}>
      <span className="absolute inline-flex h-full w-full bg-orange-500 "></span>
    </span>
  );
};
