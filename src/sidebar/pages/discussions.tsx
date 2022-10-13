import { Link } from "react-router-dom";

function Empty() {
  return (
    <div className="flex h-full select-none flex-col items-center justify-center text-slate-200">
      <svg
        className="-mt-20 w-96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        {" "}
        <path
          d="M2 5h20v14H2V5zm18 12V7H4v10h16zM8 9h2v2h2v2h-2v2H8v-2H6v-2h2V9zm6 0h2v2h-2V9zm4 4h-2v2h2v-2z"
          fill="currentColor"
        />{" "}
      </svg>
      <span className="-mt-10 px-20 text-center text-2xl">
        Add your friends to play with them!
      </span>
    </div>
  );
}

export default function Discussions() {
  return (
    <>
      <Empty />
      <Link to="/create-channel">create</Link>
      {/* <h1 className="text-lg">home</h1>
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
      </ul> */}
    </>
  );
}
