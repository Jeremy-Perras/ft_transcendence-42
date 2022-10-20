import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function useGetChannel(url: string) {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        console.log(json);
      }
    })();
  }, [url]);
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
