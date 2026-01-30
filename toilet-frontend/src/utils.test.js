import { describe, it, expect, beforeEach } from 'vitest';
import { calcDistance, makeId, loadUserToilets, saveUserToilets } from './utils';

describe('utils.js (便利関数)', () => {

  // 1. 距離計算のテスト
  describe('calcDistance', () => {
    it('同じ場所なら距離は0kmになること', () => {
      const dist = calcDistance(36.0, 140.0, 36.0, 140.0);
      expect(dist).toBe(0);
    });

    it('つくば駅と秋葉原駅の距離が妥当であること（約40~60km）', () => {
      // つくば駅: 36.083, 140.112
      // 秋葉原駅: 35.698, 139.774
      const dist = calcDistance(36.083, 140.112, 35.698, 139.774);
      
      // 結果が 40km以上、60km未満なら計算式は合っているとみなす
      expect(dist).toBeGreaterThan(40);
      expect(dist).toBeLessThan(60);
    });
  });

  // 2. ID生成のテスト
  describe('makeId', () => {
    it('IDが "u_" で始まっていること', () => {
      const id = makeId();
      expect(id.startsWith('u_')).toBe(true);
    });

    it('連続で呼んでも違うIDが生成されること（ユニーク性）', () => {
      const id1 = makeId();
      const id2 = makeId();
      expect(id1).not.toBe(id2);
    });
  });

  // 3. LocalStorage保存・読み込みのテスト
  describe('LocalStorage Helpers', () => {
    // 各テストの前に、ブラウザの記憶領域(mock)を空っぽにする
    beforeEach(() => {
      localStorage.clear();
    });

    it('データがない場合は空配列 [] を返すこと', () => {
      const data = loadUserToilets();
      expect(data).toEqual([]);
    });

    it('データを保存して、それを正しく読み込めること', () => {
      const dummyData = [
        { id: 'test1', name: 'トイレA' },
        { id: 'test2', name: 'トイレB' }
      ];

      // 保存を実行
      saveUserToilets(dummyData);

      // 読み込みを実行
      const loaded = loadUserToilets();

      // 検証
      expect(loaded).toHaveLength(2);
      expect(loaded[0].name).toBe('トイレA');
    });
  });
});