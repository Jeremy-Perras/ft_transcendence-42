/* eslint-disable prettier/prettier */
import { Link } from "react-router-dom";
import { ReactComponent as AlertIcon } from "pixelarticons/svg/alert.svg";

export default function Error404() {
  return (
    <>
      <AlertIcon className="-mt-10 w-72" />
      <span className="mt-10 px-20 text-center text-4xl tracking-wide">
        Error 404
      </span>
      <Link to="/">home</Link>
    </>
  );
}
