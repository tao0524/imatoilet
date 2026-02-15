import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';

// ★ここは変更なし（AdvancedMarkerElementに必須）
const LIBRARIES = ['places', 'marker'];

export const SafeGoogleMap = ({ children, center, zoom, style, ...props }) => {
  const [authError, setAuthError] = useState(false);

  // 1. Google Maps SDKのロード設定
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    language: 'ja', 
  });

  // 2. gm_authFailure (認証エラー) の検知
  useEffect(() => {
    window.gm_authFailure = () => {
      console.error("Google Maps Authentication Failure");
      setAuthError(true);
    };
    return () => {
      window.gm_authFailure = null;
    };
  }, []);

  // エラー時の救済画面 ---
  if (loadError || authError) {
    // 外部リンク用のURL作成
    const fallbackUrl = center 
      ? `https://www.google.com/maps?q=${center.lat},${center.lng}`
      : "https://www.google.com/maps";

    return (
      <div style={{ 
        ...style, 
        background: '#f8f9fa', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        color: '#5f6368',
        padding: '24px', 
        textAlign: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🗺️</div>
        <h3 style={{ margin: '0 0 12px', color: '#d93025', fontSize: '1.1rem' }}>地図を読み込めませんでした</h3>
        <p style={{ fontSize: '0.9rem', margin: '0 0 24px', lineHeight: '1.5', color: '#666' }}>
          一時的な通信エラーか、サービスの制限の可能性があります。<br/>
          (開発者ツールでコンソールを確認してください)
        </p>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* 救済ボタン1: 再読み込み */}
            <button 
                onClick={() => window.location.reload()}
                style={{
                    padding: '10px 18px', background: '#fff', border: '1px solid #dadce0',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#1a73e8',
                    fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'
                }}
            >
                <span>↻</span> 再読み込み
            </button>
            
            {/* 救済ボタン2: 公式サイトへ飛ばす */}
            <a 
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    padding: '10px 18px', background: '#1a73e8', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#fff',
                    textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'
                }}
            >
                Googleマップで開く ↗
            </a>
        </div>
      </div>
    );
  }

  // --- ロード中 ---
  if (!isLoaded) {
    return (
      <div style={{ ...style, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>地図を読み込み中...</p>
      </div>
    );
  }

  // --- 正常表示 ---
  return (
    <GoogleMap
      mapContainerStyle={style}
      center={center}
      zoom={zoom}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        // AdvancedMarkerElementを利用するためにマップIDを指定
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
      }}
      {...props}
    >
      {children}
    </GoogleMap>
  );
};