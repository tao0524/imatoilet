import { Link } from 'react-router-dom';
import '../base.css';       // ★追加
import '../components.css'; // ★追加
import '../index.css';      // ★追加（CSSフォルダを作っていない場合はこのパスでOK）

function Home() {
  return (
    <>
      <main className="top-main" id="top">
        <div className="container">

          <section className="hero">
            <h1 className="catch">
              困った“いま”に、<br />
              いちばん近いトイレ。
            </h1>

            <p className="sub">
              現在地と条件から、今すぐ使えるトイレを探せます。<br />
              子ども連れや車椅子の方にも配慮した情報を掲載。
            </p>

            {/* 画像を表示 */}
            <img src="/images/hero.png" alt="イメージ画像" className="hero-img" />
          </section>

          <section className="actions">
            <Link to="/search" className="btn btn-primary">🚽 近くのトイレを探す</Link>
            {/* ▼▼▼ ここを修正しました (/search → /conditions) ▼▼▼ */}
            <Link to="/conditions" className="btn btn-secondary">⚙️ 条件を指定して探す</Link>

            <div className="sub-actions">
              <Link to="/favorites" className="btn btn-sub">⭐ よく使うトイレ</Link>
              <button className="btn btn-sub" onClick={() => alert('位置情報を更新します（仮）')}>
                📍 現在地を更新
              </button>
            </div>

            {/* ✅ 副CTA：トイレ登録（検索の次に控えめに置く） */}
            <Link to="/register" className="btn btn-sub btn-register">
              ➕ トイレを登録する
            </Link>
            <p className="register-note">写真・設備情報を追加できます（任意）</p>
          </section>

          {/* 使い方 */}
          <section className="howto" id="howto">
            <h2 className="howto-title">使い方（30秒）</h2>

            <ol className="howto-steps">
              <li>
                <span className="step-num">1</span>
                <div className="step-body">
                  <div className="step-head">「近くのトイレを探す」を押す</div>
                  <div className="step-text">検索ページで近い順に一覧表示します。</div>
                </div>
              </li>

              <li>
                <span className="step-num">2</span>
                <div className="step-body">
                  <div className="step-head">位置情報を許可（距離表示）</div>
                  <div className="step-text">許可すると距離が表示され、近い順に並び替えます。</div>
                </div>
              </li>

              <li>
                <span className="step-num">3</span>
                <div className="step-body">
                  <div className="step-head">条件をチェック（車椅子 / オムツ / 24時間）</div>
                  <div className="step-text">必要な設備だけに絞り込めます。</div>
                </div>
              </li>

              <li>
                <span className="step-num">4</span>
                <div className="step-body">
                  <div className="step-head">トイレを登録する（任意）</div>
                  <div className="step-text">
                    見つけたトイレを、自分用に登録できます。<br />
                    写真や設備情報も追加できます（公開はされません）。
                  </div>
                </div>
              </li>
            </ol>

            <div className="howto-cta">
              <Link to="/search" className="btn btn-primary">🚽 今すぐ探す</Link>
              <a href="#top" className="howto-toplink">ページ上部へ</a>
            </div>

            <p className="howto-note">
              ※ 位置情報を許可しない場合は、距離は表示されません（条件検索は利用できます）。
            </p>
          </section>

        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', fontSize: '0.8rem', color: '#666' }}>
        <p>※本サイトは開発中のポートフォリオ（デモ）です。<br />
          登録したデータはブラウザ内にのみ保存され、他者とは共有されません。</p>
        <p>&copy; 2026 Imatoilet Project</p>
      </footer>
    </>
  );
}

export default Home;
