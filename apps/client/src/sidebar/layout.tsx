import { useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { useMediaQuery } from "@react-hookz/web";
import { ReactComponent as ArrowLeftBoxIcon } from "pixelarticons/svg/arrow-left-box.svg";
import { ReactComponent as CloseIcon } from "pixelarticons/svg/close.svg";
import { ReactComponent as SearchIcon } from "pixelarticons/svg/search.svg";
import { ReactComponent as BackBurgerIcon } from "pixelarticons/svg/backburger.svg";
import { ReactComponent as MessagePlusIcon } from "pixelarticons/svg/message-plus.svg";
import { SideBarContext } from "./context";

const SearchBar = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="relative grow border-r-2">
      <input
        type="text"
        className="w-full py-1 px-2 text-lg focus:outline-none focus:ring-2 focus:ring-inset"
        placeholder="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="absolute inset-y-0 right-2 flex items-center">
        {search.length > 0 ? (
          <button onClick={() => setSearch("")}>
            <CloseIcon className="h-6 text-slate-400" />
          </button>
        ) : (
          <SearchIcon className="h-6 text-slate-400" />
        )}
      </div>
    </div>
  );
};

const LeftButton = ({
  navigate,
  Icon,
}: {
  navigate: () => void;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}) => {
  return (
    <motion.button
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
      transition={{ duration: 0.0 }}
      onClick={navigate}
      className="border-r-2 transition-colors duration-200 hover:text-slate-500"
    >
      <Icon className="h-9" />
    </motion.button>
  );
};

function Header() {
  const location = useLocation();
  const home = location.pathname === "/";
  const navigate = useNavigate();
  const setShowSideBar = useContext(SideBarContext);
  const isSmallScreen = useMediaQuery("(max-width: 1536px)");

  return (
    <div className="flex border-b-2 border-black">
      <AnimatePresence initial={false} exitBeforeEnter>
        {home ? (
          <>
            <LeftButton
              navigate={() => navigate("/create-channel")}
              Icon={MessagePlusIcon}
              key={1}
            />
            <SearchBar key={2} />
          </>
        ) : (
          <>
            <LeftButton
              key={3}
              navigate={() => navigate(-1)}
              Icon={ArrowLeftBoxIcon}
            />
            <div
              key={4}
              className="relative grow border-r-2 text-center text-lg"
            >
              {location.pathname}
            </div>
          </>
        )}
      </AnimatePresence>
      {isSmallScreen ? (
        <button onClick={() => setShowSideBar && setShowSideBar(false)}>
          <BackBurgerIcon className="h-9 rotate-180 transition-colors duration-200 hover:text-slate-500" />
        </button>
      ) : null}
    </div>
  );
}

export const SidebarLayout = () => {
  const { pathname } = useLocation();
  const nav = useNavigationType();

  const variants = {
    visible: {
      transition: {
        duration: nav === "PUSH" ? 0.2 : 0,
        ease: "easeIn",
      },
      x: 0,
    },
    hidden: {
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
      x: nav === "PUSH" ? "100%" : 0,
      zIndex: nav === "PUSH" ? 10 : 0,
    },
  };

  return (
    <>
      <Header />
      <AnimatePresence initial={false}>
        <motion.div
          className="h-full overflow-y-auto"
          key={pathname}
          variants={variants}
          initial={{ x: "100%" }}
          animate="visible"
          exit="hidden"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </>
  );
};
