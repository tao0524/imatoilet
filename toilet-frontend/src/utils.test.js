import { calcDistance, makeId, loadUserToilets, saveUserToilets, buildEquipmentArray, normalizeEquipment } from './utils';
import { vi } from 'vitest'; // console.warnのモック用にvitestからviをインポート

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
  
  // 4. buildEquipmentArray のテスト
  describe('buildEquipmentArray', () => {
    it('登録されたキーが正しくEnum名に変換されること', () => {
      // 意図的に open24h (特殊変換) を含めてテストする
      const conditions = {
        wheelchair: true,
        open24h: true, 
        diaper: false
      };
      const result = buildEquipmentArray(conditions);
      // OPEN_24H に正しく変換され、falseのdiaperは除外されること
      expect(result).toEqual(['WHEELCHAIR', 'OPEN_24H']);
    });

    it('CONDITION_MAPに未登録のキーは安全に除外されること', () => {
      // ターミナルが警告ログで汚れるのを防ぐため、一時的にconsole.warnをモック（無効化）する
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const conditions = {
        wheelchair: true,
        unknown_key: true // 未登録の無効なキー
      };
      const result = buildEquipmentArray(conditions);
      
      // unknown_key は無視され、正常なWHEELCHAIRだけが返ること
      expect(result).toEqual(['WHEELCHAIR']); 

      consoleWarnSpy.mockRestore(); // モックを元に戻す
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
      // スペースや小文字が混ざっていても、大文字にトリム・変換できるかを検証
      const toilet = { equipment: 'wheelchair, open_24h' }; 
      const result = normalizeEquipment(toilet);
      expect(result.has('WHEELCHAIR')).toBe(true);
      expect(result.has('OPEN_24H')).toBe(true);
      expect(result.size).toBe(2);
    });

    it('互換フラグ (古いデータの真偽値) を正しくSetに変換すること', () => {
      const toilet = { wheelchair: true, diaper: true, open24h: false };
      const result = normalizeEquipment(toilet);
      expect(result.has('WHEELCHAIR')).toBe(true);
      expect(result.has('DIAPER')).toBe(true);
      // falseのものは含まれないこと
      expect(result.has('OPEN_24H')).toBe(false); 
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