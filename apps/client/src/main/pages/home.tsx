import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores";

export default function Home() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <div className="flex h-full w-full items-center justify-center bg-contain  bg-center bg-no-repeat text-white">
      {isLoggedIn ? (
        <Link
          to="/gamehomepage"
          className="animate-pulse cursor-pointer select-none text-7xl"
        >
          Click To Play
        </Link>
      ) : (
        <a
          href="http://localhost:3000/auth/login"
          className="animate-pulse cursor-pointer select-none text-7xl"
        >
          Click To Login
        </a>
      )}
    </div>
  );
}
