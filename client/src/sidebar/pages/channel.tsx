import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

async function useGetChannel(url: string): Promise<string> {
  const [data, setData] = useState(null);
  useEffect(() => {
    let ignore = false;
    fetch(new URL(url))
      .then((response) => response.json())
      .then((json) => {
        if (!ignore) {
          console.log(json);
        }
      });
    return () => {
      ignore = true;
    };
  }, [url]);

  return "";
}

// const res = await fetch(url);
// const json = await res.json();

export default function Channel() {
  const [test, setTest] = useState("");
  const url = "http://localhost:3000/api/channels/v";
  const results = useGetChannel(url);
  return (
    <>
      <input type="text" onChange={(e) => setTest(e.target.value)} />
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
      <div className="text-white"></div>
    </>
  );
}
