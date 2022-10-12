import { Link } from "react-router-dom";
import Header from "../header.component";

export default function Channel() {
  return (
    <>
      <Header />
      <h1 className="text-lg">channel</h1>
      <ul>
        <li>
          <Link to="/">list</Link>
        </li>
        <li>
          <Link to="/channel/test">channel</Link>
        </li>
        <li>
          <Link to="/chat/test">chat</Link>
        </li>
        <li>
          <Link to="/profile/user">profile</Link>
        </li>
      </ul>
    </>
  );
}
