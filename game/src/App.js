import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Game from "./pages/Game";
import Home from "./pages/Home";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/Game" element={<Game />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
