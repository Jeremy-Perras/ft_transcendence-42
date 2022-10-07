import ReactDOM from "react-dom/client";
import { motion } from "framer-motion";
import React from "react";

const App = () => {
  return (
    <>
      <div className="relative h-full w-full ">
        {/* <div className="h-full">
          <motion.div
            className="h-5 w-48 bg-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        </div> */}
      </div>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
