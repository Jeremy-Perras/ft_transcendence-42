import React from "react";
import ReactDOM from "react-dom/client";
import Icon from "@mdi/react";
import {
  mdiAccountGroup,
  mdiChevronRight,
  mdiCloseThick,
  mdiDotsCircle,
} from "@mdi/js";
import { motion } from "framer-motion";

import Verso from "./pongClassic.png";
import Recto from "./Recto.png";
import "./index.css";

// const RightBarBtn = ({
//   className,
//   rightBar,
//   setRightBar,
// }: {
//   className?: string;
//   rightBar: boolean;
//   setRightBar: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   const toggleBar = () => {
//     setRightBar(!rightBar);
//   };

//   return (
//     <button
//       className={`${className} p-1 transition-colors duration-200 hover:text-gray-500 lg:invisible`}
//       onClick={toggleBar}
//     >
//       <Icon
//         path={rightBar ? mdiChevronRight : mdiAccountGroup}
//         title="Close menu"
//         size={1}
//       />
//     </button>
//   );
// };

// const ClosePopUp = ({
//   className,
//   popUp,
//   setPopUp,
// }: {
//   className?: string;
//   popUp: boolean;
//   setPopUp: React.Dispatch<React.SetStateAction<boolean>>;
// }) => {
//   const togglePopUp = () => {
//     setPopUp(!popUp);
//   };

//   return (
//     <button
//       className={`${className} absolute top-0 right-0 m-2`}
//       onClick={togglePopUp}
//     >
//       <Icon path={mdiCloseThick} title="Close popup" size={1} />
//     </button>
//   );
// };

const Card = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div
      style={{
        backgroundImage: `url(${Verso})`, //change bg if is open or not
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        height: "70%",
        backgroundSize: "40%",
      }}
      className="flex h-2/3 w-1/3 justify-center items-center"
    >
      {" "}
      <motion.div
        className={`flex h-full w-full ${
          isOpen ? "bg-slate-800" : "bg-black"
        } m-2 rounded-lg lg:m-10 2xl:m-28`}
        initial={{ opacity: 0.6 }}
        whileHover={{ scale: [null, 1.3, 1.2], opacity: 1 }}
        whileTap={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsOpen((isOpen) => !isOpen)}
      />
    </div>
  );
};

const App = () => {
  return (
    <>
      <div className="relative flex flex-row h-full w-full p-2 lg:p-1/3 2xl:p-28 justify-center items-center bg-slate-200">
        <Card />
        <Card />
        <Card />
      </div>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// import { motion } from "framer-motion"

// const variants = {
//   open: { opacity: 1, x: 0 },
//   closed: { opacity: 0, x: "-100%" },
// }

// export const MyComponent = () => {
//   const [isOpen, setIsOpen] = useState(false)

//   return (
//     <motion.nav
//       animate={isOpen ? "open" : "closed"}
//       variants={variants}
//     >
//       <Toggle onClick={() => setIsOpen(isOpen => !isOpen)} />
//       <Items />
//     </motion.nav>
//   )
// }
