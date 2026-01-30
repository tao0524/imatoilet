import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Search from './pages/Search';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
import Register from './pages/Register'; // ★追加

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/favorites" element={<Favorites />} />
        
        {/* ▼▼▼ 変更：登録ページを本物に ▼▼▼ */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
