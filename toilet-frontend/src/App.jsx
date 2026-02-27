// toilet-frontend/src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Search from './pages/Search';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
import Register from './pages/Register';
import Conditions from './pages/Conditions';
import Edit from './pages/Edit';
// ★ ここを追加（インポート）
import CoordinateEditor from './pages/CoordinateEditor'; 

function App() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <>
      {isHome && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/conditions" element={<Conditions />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/register" element={<Register />} />
        {/* ★ ここを追加（隠しルート） */}
        <Route path="/admin/coord-editor" element={<CoordinateEditor />} />
      </Routes>
    </>
  );
}

export default App;
