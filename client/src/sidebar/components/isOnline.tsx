import { UserStatus } from "../../graphql/generated";

export const IsOnline = ({ userStatus }: { userStatus: UserStatus }) => {
  return userStatus === UserStatus.Online ? (
    <span className="absolute top-0 left-0 flex h-1 w-1">
      <span className="absolute inline-flex h-full w-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex h-1 w-1 bg-green-500"></span>
    </span>
  ) : (
    <span className={`absolute top-0 left-0 flex h-1 w-1`}>
      <span className="absolute inline-flex h-full w-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex h-1 w-1 bg-red-500"></span>
    </span>
  );
};
