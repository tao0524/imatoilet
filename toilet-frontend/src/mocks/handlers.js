import { http, HttpResponse } from 'msw'

// APIのエンドポイントと、返すデータを定義します
export const handlers = [
  // 1. 一覧取得APIのモック（既存のまま）
  http.get('http://localhost:8080/api/toilets', () => {
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
  }),

  // 2. 【追加】個別取得APIのモック
  http.get('http://localhost:8080/api/toilets/:id', ({ params }) => {
    // 存在しないIDの場合は404を返す
    if (params.id === '999') {
      return new HttpResponse(null, { status: 404 });
    }
    // 正常な場合はダミーの詳細データを返す
    return HttpResponse.json({
      id: Number(params.id),
      name: 'つくば駅前公衆トイレ（テスト用）',
      address: '茨城県つくば市吾妻1-1',
      description: 'これはテスト用のダミーデータです。',
      lat: 36.083,
      lng: 140.112,
      equipment: ['WHEELCHAIR', 'DIAPER'], // "車椅子OK" のテストをパスするために必要
      cleanliness: 5,
      publicUse: true,
      image: null
    });
  }),

  // 3. 【追加】レビュー取得APIのモック
  http.get('http://localhost:8080/api/toilets/:id/reviews', () => {
    // 空のレビュー一覧を返す
    return HttpResponse.json([]);
  })
]