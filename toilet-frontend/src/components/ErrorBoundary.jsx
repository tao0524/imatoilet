import React from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>予期せぬエラーが発生しました</h2>
          <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
            申し訳ありません。アプリに問題が発生しました。<br />
            ページを再読み込みするか、トップページに戻ってください。
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '10px 20px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              再読み込み
            </button>
            <a 
              href="/" 
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              トップへ戻る
            </a>
          </div>

          {/* 開発環境でのみエラー詳細を表示 */}
          {import.meta.env.DEV && this.state.error && (
            <div style={{ marginTop: '40px', textAlign: 'left' }}>
              <details style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>エラー詳細（開発者用）</summary>
                <pre style={{ 
                  marginTop: '10px', 
                  fontSize: '12px', 
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;