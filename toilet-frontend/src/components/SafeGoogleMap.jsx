// toilet-frontend/src/components/SafeGoogleMap.jsx
import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';

const LIBRARIES = ['marker']; // 必要に応じて 'places' や 'geometry' を追加

/**
 * Google Mapsの読み込みとエラーハンドリングを一元管理するラッパー
 * API制限(Quota Exceeded)や認証エラー時に、地図の代わりにメッセージを表示します。
 */
export const SafeGoogleMap = ({ children, center, zoom, style, ...props }) => {
  const [authError, setAuthError] = useState(false);

  // 1. Google Maps SDKのロード設定
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    language: 'ja', // 日本語化
  });

  // 2. gm_authFailure (APIキー無効、請求エラー、クォータ超過など) の検知
  useEffect(() => {
    window.gm_authFailure = () => {
      console.error("Google Maps Authentication Failure (Quota exceeded or Invalid Key)");
      setAuthError(true);
    };

    return () => {
      window.gm_authFailure = null;
    };
  }, []);

  // --- エラー時の表示 (フォールバック) ---
  if (loadError || authError) {
    return (
      <div style={{ 
        ...style, 
        background: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#666',
        padding: '20px',
        textAlign: 'center'
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
      }}
      {...props}
    >
      {children}
    </GoogleMap>
  );
};