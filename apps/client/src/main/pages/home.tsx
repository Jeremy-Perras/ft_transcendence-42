import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-contain bg-center bg-no-repeat"
      style={{ backgroundImage: "url(pong.webp)" }}
    >
      <Link
        to="/gamehomepage"
        className="animate-pulse select-none font-cursive text-5xl font-bold tracking-widest text-stone-700 hover:animate-none"
      >
        Click To Play
      </Link>
    </div>
  );
}
