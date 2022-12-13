import { motion } from "framer-motion";
import { useEffect } from "react";

export const error = ({
  message,
  showMessageError,
  setShowMessageError,
}: {
  message: string;
  showMessageError: boolean;
  setShowMessageError: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessageError(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return showMessageError ? (
    <motion.span
      initial={{ y: "-200%" }}
      transition={{ duration: 2 }}
      animate={{ y: "calc(0vw )" }}
      onClick={() => setShowMessageError(false)}
      className="relative flex h-full min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-50"
    >
      {message}
    </motion.span>
  ) : null;
};
