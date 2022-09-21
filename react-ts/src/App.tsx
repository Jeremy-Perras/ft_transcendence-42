import About from './pages/About';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home'; 
import Game from './pages/Game';
const App = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/game" element={<Game />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    );
  };

export default App;