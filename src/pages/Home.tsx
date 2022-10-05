import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";

type InputProps = {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

function Input({ input, setInput }: InputProps) {
  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    console.log(e);
    setInput(e.currentTarget.value);
  };

  return (
    <input
      className="border-2"
      type="text"
      value={input}
      onChange={handleChange}
    />
  );
}

function Home() {
  const [input, setInput] = useState("");

  return (
    <>
      <Navigation />
      <div className="m-4">
        Home
        <Input input={input} setInput={setInput} />
        {input && (
          <Link className="border-2 border-solid" to={`Profile/${input}`}>
            go to {input}&apos; s profile
          </Link>
        )}
      </div>
    </>
  );
}
export default Home;
