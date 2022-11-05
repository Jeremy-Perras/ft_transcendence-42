import { Link } from "react-router-dom";

export default function Game() {
  return (
    <>
      <h1 className="bg-white">Game</h1>
      <Link to="/" className="bg-white">
        home
      </Link>
    </>
  );
}
