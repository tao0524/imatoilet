import { http, HttpResponse } from 'msw'

// APIのエンドポイントと、返すデータを定義します
export const handlers = [
  // http.get(URL, リゾルバ関数)
  // Detail.jsx がリクエストするURLと一致させます
  http.get('http://localhost:8080/api/toilets', () => {
    
    // 偽のレスポンス（JSON）を返します
    return HttpResponse.json([
      {
        id: 1,
        name: 'つくば駅前公衆トイレ（テスト用）',
        address: '茨城県つくば市吾妻1-1',
        description: 'これはテスト用のダミーデータです。',
        lat: 36.083,
        lng: 140.112,
        wheelchair: true,
        diaper: true,
        open24h: false,
        publicUse: true,
        image: null
      },
      {
        id: 2,
        name: '中央公園トイレ（テスト用）',
        address: '茨城県つくば市吾妻2-2',
        description: 'きれいです。',
        lat: 36.085,
        lng: 140.115,
        wheelchair: false,
        diaper: false,
        open24h: true,
        publicUse: true,
        image: null
      }
    ])
  })
]