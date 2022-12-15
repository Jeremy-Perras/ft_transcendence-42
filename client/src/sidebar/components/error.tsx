import { useErrorStore } from "client/src/stores";
import { motion } from "framer-motion";
import { useEffect } from "react";

const ErrorLabel = ({ error, index }: { error: string; index: number }) => {
  const removeError = useErrorStore((state) => state.removeError);
  useEffect(() => {
    const timer = setTimeout(() => {
      removeError(index);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.span
      onClick={() => removeError(index)}
      initial={{ y: "-200%" }}
      transition={{ duration: 2 }}
      animate={{ y: "calc(0vw )" }}
      exit={{ opacity: 0 }}
      className="relative flex h-full min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-50 transition-all"
    >
      {error}
    </motion.span>
  );
};

export const ErrorMessages = () => {
  const errors = useErrorStore.getState().errorList;

  return (
    <div className="absolute top-0 flex flex-col justify-start">
      {errors.map((error, index) => (
        <ErrorLabel error={error} index={index} />
      ))}
    </div>
  );
};
