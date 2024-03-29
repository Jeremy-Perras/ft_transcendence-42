import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "react-router-dom";
import { ReactComponent as BackBurgerIcon } from "pixelarticons/svg/backburger.svg";

import { ReactComponent as UsersIcon } from "pixelarticons/svg/users.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { useSidebarStore } from "../../stores";

import * as Avatar from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";
import { request } from "graphql-request";
import { graphql } from "../../../src/gql/gql";

const UserHeaderQueryDocument = graphql(`
  query UserHeader($userId: Int) {
    user(id: $userId) {
      id
      name
      status
    }
  }
`);

const CurrentUserProfile = () => {
  const navigate = useNavigate();
  const { data, isFetched } = useQuery({
    queryKey: ["UserHeader"],
    queryFn: async () =>
      request("/graphql", UserHeaderQueryDocument, { userId: null }),
  });

  return (
    <div
      className="flex w-10 shrink-0 grow-0 cursor-pointer flex-col justify-center"
      onClick={() => navigate(`/profile/${data?.user.id}`)}
    >
      <Avatar.Root>
        {isFetched ? (
          <Avatar.Image
            className="h-9 w-10 border-l-2 transition-all hover:brightness-90"
            src={`/upload/avatar/${data?.user.id}`}
          />
        ) : null}
        <Avatar.Fallback delayMs={0}>
          <UserIcon className="h-9 border-l-2 transition-colors duration-200 hover:text-slate-500" />
        </Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
};

const CloseSidebar = () => {
  const closeSidebar = useSidebarStore((state) => state.close);

  return (
    <div className="flex w-10 shrink-0 grow-0 cursor-pointer flex-col justify-center border-x-2">
      <BackBurgerIcon
        onClick={closeSidebar}
        className="h-9 rotate-180 cursor-pointer transition-colors duration-200 hover:text-slate-500"
      />
    </div>
  );
};

export const HeaderNavigateBack = () => {
  const navigate = useNavigate();
  return (
    <UsersIcon
      className="mb-[-0.25rem] h-8 cursor-pointer transition-colors duration-200 hover:text-slate-500"
      onClick={() => {
        navigate("/");
      }}
    />
  );
};

export const HeaderCenterContent = ({
  children,
}: {
  children: JSX.Element;
}) => {
  return (
    <div className="relative flex min-w-0 shrink grow basis-0 flex-col justify-center">
      {children}
    </div>
  );
};

export const HeaderLeftBtn = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="flex w-10 shrink-0 grow-0 cursor-pointer flex-col justify-center border-x-2">
      {children}
    </div>
  );
};

export const Header = ({
  className,
  children,
}: {
  className?: string;
  children: JSX.Element;
}) => {
  const isSmallScreen = useMediaQuery("(max-width: 1536px)");
  return (
    <div
      className={`${
        typeof className !== "undefined" ? className : ""
      } z-10 flex  w-full shadow-sm shadow-slate-400`}
    >
      {children}
      <CurrentUserProfile />
      {isSmallScreen ? <CloseSidebar /> : null}
    </div>
  );
};
