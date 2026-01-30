import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// テスト開始前に、偽のAPIサーバーを起動します
beforeAll(() => server.listen());

// 各テストが終わるごとに、ハンドラーの状態をリセットします
// (あるテストでイレギュラーな設定をしても、次のテストに影響させないため)
afterEach(() => server.resetHandlers());

// 全てのテストが終了したら、サーバーを停止します
afterAll(() => server.close());