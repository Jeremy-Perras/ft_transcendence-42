import { useMediaQuery } from "@react-hookz/web";
import { useNavigate } from "react-router-dom";
import { ReactComponent as BackBurgerIcon } from "pixelarticons/svg/backburger.svg";
import { useSidebarStore } from "../../stores";
import { useUserProfileHeaderQuery } from "../../graphql/generated";

const CurrentUserProfile = () => {
  const navigate = useNavigate();

  // TODO: handle error / loading
  const { data } = useUserProfileHeaderQuery();

  return (
    <div
      className="flex w-10 shrink-0 grow-0 justify-center  border-x-2 transition-all hover:cursor-pointer hover:bg-slate-100"
      onClick={() => navigate(`/profile/${data?.user.id}`)}
    >
      <img
        className="top-1 right-1 h-8 w-8 shrink-0 self-center border border-black"
        src={`${data?.user.avatar}`} // TODO: use local avatar
        alt="Current user avatar"
      />
    </div>
  );
};

const CloseSidebar = () => {
  const isSmallScreen = useMediaQuery("(max-width: 1536px)");
  const closeSidebar = useSidebarStore((state) => state.close);

  return (
    <>
      {isSmallScreen ? (
        <BackBurgerIcon
          onClick={closeSidebar}
          className="h-9 rotate-180 transition-colors duration-200 hover:text-slate-500"
        />
      ) : null}
    </>
  );
};

export const Header = ({ children }: { children: JSX.Element }) => {
  return (
    <div className="z-10 flex w-full shadow-sm shadow-slate-400">
      {children}
      <CurrentUserProfile />
      <CloseSidebar />
    </div>
  );
};
