import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';

// ★修正: 'marker' ライブラリを復活させました（AdvancedMarkerElementに必須）
const LIBRARIES = ['places', 'marker'];

export const SafeGoogleMap = ({ children, center, zoom, style, ...props }) => {
  const [authError, setAuthError] = useState(false);

  // 1. Google Maps SDKのロード設定
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    language: 'ja', 
  });

  // 2. gm_authFailure の検知
  useEffect(() => {
    window.gm_authFailure = () => {
      console.error("Google Maps Authentication Failure");
      setAuthError(true);
    };
    return () => {
      window.gm_authFailure = null;
    };
  }, []);

  // --- エラー時の表示 ---
  if (loadError || authError) {
    return (
      <div style={{ 
        ...style, background: '#f0f0f0', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', flexDirection: 'column', color: '#666',
        padding: '20px', textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px', color: '#d32f2f' }}>地図を表示できません</h3>
        <p style={{ fontSize: '0.9rem' }}>
          現在、アクセス集中またはデモ制限のため<br/>
          Google Mapsの表示を一時的に停止しています。<br/>
          <strong>リスト一覧からトイレ情報を確認してください。</strong>
        </p>
      </div>
    );
  }

  // --- ロード中 ---
  if (!isLoaded) {
    return (
      <div style={{ ...style, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>地図を読み込み中...</p>
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
        // ★追加: AdvancedMarkerElementを利用するためにマップIDを指定
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
      }}
      {...props}
    >
      {children}
    </GoogleMap>
  );
};