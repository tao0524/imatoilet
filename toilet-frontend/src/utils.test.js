import { calcDistance, makeId, loadUserToilets, saveUserToilets, buildEquipmentArray, normalizeEquipment } from './utils';
import { vi } from 'vitest';

describe('utils.js (便利関数)', () => {

  // 1. 距離計算のテスト
  describe('calcDistance', () => {
    it('同じ場所なら距離は0kmになること', () => {
      const dist = calcDistance(36.0, 140.0, 36.0, 140.0);
      expect(dist).toBe(0);
    });

    it('つくば駅と秋葉原駅の距離が妥当であること（約40~60km）', () => {
      const dist = calcDistance(36.083, 140.112, 35.698, 139.774);
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

      saveUserToilets(dummyData);
      const loaded = loadUserToilets();

      expect(loaded).toHaveLength(2);
      expect(loaded[0].name).toBe('トイレA');
    });
  });
  
  // 4. buildEquipmentArray のテスト
  describe('buildEquipmentArray', () => {
    it('登録されたキーが正しくEnum名に変換されること', () => {
      const conditions = {
        wheelchair: true,
        open24h: true, 
        diaper: false
      };
      const result = buildEquipmentArray(conditions);
      expect(result).toEqual(['WHEELCHAIR', 'OPEN_24H']);
    });

    it('CONDITION_MAPに未登録のキーは安全に除外されること', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const conditions = {
        wheelchair: true,
        unknown_key: true 
      };
      const result = buildEquipmentArray(conditions);
      
      expect(result).toEqual(['WHEELCHAIR']); 

      consoleWarnSpy.mockRestore(); 
    });
  });

  // 5. normalizeEquipment のテスト
  describe('normalizeEquipment', () => {
    it('新形式 (配列) を正しくSetに変換すること', () => {
      const toilet = { equipment: ['WHEELCHAIR', 'OPEN_24H'] };
      const result = normalizeEquipment(toilet);
      expect(result.has('WHEELCHAIR')).toBe(true);
      expect(result.has('OPEN_24H')).toBe(true);
      expect(result.size).toBe(2);
    });

    it('旧形式 (CSV文字列) を正しくSetに変換すること', () => {
      const toilet = { equipment: 'wheelchair, open_24h' }; 
      const result = normalizeEquipment(toilet);
      expect(result.has('WHEELCHAIR')).toBe(true);
      expect(result.has('OPEN_24H')).toBe(true);
      expect(result.size).toBe(2);
    });

    it('equipmentがnullや空の場合は空のSetを返すこと', () => {
      const toilet1 = { equipment: null };
      const toilet2 = { equipment: [] };
      const toilet3 = { equipment: '' };
      expect(normalizeEquipment(toilet1).size).toBe(0);
      expect(normalizeEquipment(toilet2).size).toBe(0);
      expect(normalizeEquipment(toilet3).size).toBe(0);
    });
  });
});