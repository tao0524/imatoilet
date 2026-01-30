import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="site-header">
      <div className="container">
        {/* Linkタグを使うと、ページを再読み込みせずにサッと移動できます */}
        <Link to="/" className="logo">
          <span className="logo-now">いま</span>
          <span className="logo-icon">🚽</span>
          <span className="logo-main">トイレ</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
