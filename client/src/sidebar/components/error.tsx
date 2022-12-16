import { useErrorStore } from "../../stores";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const ErrorMessages = ({ error }: { error: string }) => {
  // const removeError = useErrorStore((state) => state.removeError);
  const [display, setDisplay] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplay(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      {display && (
        <>
          <motion.span
            onClick={() => setDisplay(false)}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full items-center justify-center truncate bg-red-300 text-center transition-all"
          >
            {error}
          </motion.span>
        </>
      )}
    </>
  );
};

// export const ErrorMessages = () => {
//   // const errors = useErrorStore.getState().errorList;
//   // console.log(errors);
//   // useEffect(() => {
//   //   () => {
//   //     return;
//   //   };
//   // }, [errors]);
//   const errors = ["error1"];
//   return (
//     <div className="absolute top-0 ">
//       {errors.map((error, index) => (
//         <ErrorLabel
//           error={error}
//           index={index}
//           key={error + index.toString()}
//         />
//       ))}
//     </div>
//   );
// };
