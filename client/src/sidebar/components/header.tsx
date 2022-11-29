import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "react-router-dom";
import { ReactComponent as BackBurgerIcon } from "pixelarticons/svg/backburger.svg";

import { ReactComponent as ArrowLeftIcon } from "pixelarticons/svg/arrow-left-box.svg";
import { ReactComponent as UserIcon } from "pixelarticons/svg/user.svg";
import { useSidebarStore } from "../../stores";
import { useUserProfileHeaderQuery } from "../../graphql/generated";
import * as Avatar from "@radix-ui/react-avatar";

const CurrentUserProfile = () => {
  const navigate = useNavigate();
  const { data, isFetched } = useUserProfileHeaderQuery();
  return (
    <div
      className="flex w-10 shrink-0 grow-0 cursor-pointer flex-col justify-center"
      onClick={() => navigate(`/profile/${data?.user.id}`)}
    >
      <Avatar.Root>
        {isFetched ? (
          <Avatar.Image
            className="w-10 transition-all hover:brightness-90"
            src={`/uploads/avatars/${data?.user.avatar}`}
          />
        ) : null}
        <Avatar.Fallback delayMs={0}>
          <UserIcon className="w-10 border-l-2 transition-colors duration-200 hover:text-slate-500" />
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
    <ArrowLeftIcon
      className="h-9 cursor-pointer transition-colors duration-200 hover:text-slate-500"
      onClick={() => {
        navigate(-1);
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
    <div className="relative flex w-full grow flex-col justify-center">
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
        className !== "undefined" ? className : ""
      } z-10 flex w-full shadow-sm shadow-slate-400`}
    >
      {children}
      <CurrentUserProfile />
      {isSmallScreen ? <CloseSidebar /> : null}
    </div>
  );
};
