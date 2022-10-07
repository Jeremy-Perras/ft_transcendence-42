import React from "react";
import ReactDOM from "react-dom/client";
import { motion } from "framer-motion";

import "./index.css";

const App = () => {
  return (
    <div className="flex flex-col ">
      <motion.div
        className="m-8 h-9 w-9 bg-red-500"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      />
      <motion.div
        className="m-8 h-9 w-9 bg-red-500"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      />
      <motion.div
        className=" m-8 h-9 w-9 bg-red-500"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
