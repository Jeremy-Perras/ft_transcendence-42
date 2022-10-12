import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex border-b-2 border-black  font-cursive">
      {location.pathname === "/" ? (
        <Link
          to="/create-channel"
          className="border-r-2 transition-colors duration-200 hover:text-blue-900"
        >
          <svg
            className="h-9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {" "}
            <path
              d="M20 2H2v20h2V4h16v12H6v2H4v2h2v-2h16V2h-2zm-7 7h3v2h-3v3h-2v-3H8V9h3V6h2v3z"
              fill="currentColor"
            />{" "}
          </svg>
        </Link>
      ) : (
        <button
          onClick={() => navigate(-1)}
          className="border-r-2 transition-colors duration-200 hover:text-blue-900"
        >
          <svg
            className="h-9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            {" "}
            <path
              d="M21 3v18H3V3h18zM5 19h14V5H5v14zm12-8v2h-6v2H9v-2H7v-2h2V9h2v2h6zm-4-2h-2V7h2v2zm0 8v-2h-2v2h2z"
              fill="currentColor"
            />{" "}
          </svg>
        </button>
      )}
      <div className="relative grow border-r-2">
        <input
          type="text"
          className="w-full py-1 px-2 text-lg focus:outline-none focus:ring-2 focus:ring-inset"
          placeholder="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          {search.length > 0 ? (
            <button onClick={() => setSearch("")}>
              <svg
                className="h-6 text-slate-400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z"
                  fill="currentColor"
                />{" "}
              </svg>
            </button>
          ) : (
            <svg
              className="h-6 text-slate-400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {" "}
              <path
                d="M6 2h8v2H6V2zM4 6V4h2v2H4zm0 8H2V6h2v8zm2 2H4v-2h2v2zm8 0v2H6v-2h8zm2-2h-2v2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm0-8h2v8h-2V6zm0 0V4h-2v2h2z"
                fill="currentColor"
              />{" "}
            </svg>
          )}
        </div>
      </div>
      <button onClick={(e) => e.preventDefault()}>
        <svg
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-9 rotate-180 duration-200 hover:text-red-900"
        >
          {" "}
          <path
            d="M11 7h10v2H11V7zm-8 4h2V9h2v2h14v2H7v2H5v-2H3v-2zm4 4v2h2v-2H7zm0-6V7h2v2H7zm14 6H11v2h10v-2z"
            fill="currentColor"
          />{" "}
        </svg>
      </button>
    </div>
  );
}
