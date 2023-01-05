import { motion } from "framer-motion";
import { useEffect } from "react";

export const ErrorMessage = ({
  setDisplay,
  error,
}: {
  setDisplay: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplay(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <motion.span
        onClick={() => setDisplay(false)}
        transition={{
          duration: 0.1,
          ease: "linear",
          repeatType: "reverse",
          repeat: 1,
          repeatDelay: 2.8,
        }}
        initial={{ y: -36 }}
        animate={{ y: 0 }}
        className="absolute top-0 left-0 z-20 h-9 w-full truncate border-b border-red-500 bg-red-400 pt-1.5 text-center align-middle transition-all hover:cursor-pointer"
      >
        {error}
      </motion.span>
    </>
  );
};
