import { Link } from "react-router-dom";

export default function Profile() {
  return (
    <>
      <h1 className="text-lg">profile</h1>
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
