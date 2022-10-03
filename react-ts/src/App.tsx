import About from './pages/About';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Game from './pages/Game';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/game" element={<Game />} />
        <Route path="*" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;