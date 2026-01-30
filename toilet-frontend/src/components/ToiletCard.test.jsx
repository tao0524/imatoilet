import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ToiletCard from './ToiletCard';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('ToiletCard Component', () => {
  // テスト用のダミーデータを作成
  const mockToilet = {
    id: 999,
    name: 'テスト中央公園',
    address: '茨城県つくば市吾妻1-1',
    publicUse: true,     // 「公共」タグが出るはず
    wheelchair: true,    // 「多目的」タグが出るはず
    diaper: false,       // 「オムツ交換」タグは出ないはず
  };

  it('トイレの名前と住所が正しく表示されること', () => {
    render(
      <MemoryRouter>
        <ToiletCard toilet={mockToilet} />
      </MemoryRouter>
    );

    // 名前と住所が表示されているか確認
    expect(screen.getByText('テスト中央公園')).toBeInTheDocument();
    expect(screen.getByText('📍 茨城県つくば市吾妻1-1')).toBeInTheDocument();
  });

  it('条件（Props）に応じてタグの出し分けができること', () => {
    render(
      <MemoryRouter>
        <ToiletCard toilet={mockToilet} />
      </MemoryRouter>
    );

    // trueのものは画面にあるはず
    expect(screen.getByText('公共')).toBeInTheDocument();
    expect(screen.getByText('多目的')).toBeInTheDocument();

    // falseのものは画面にないはず（queryByTextは、見つからない場合にnullを返すのでエラーにならない）
    expect(screen.queryByText('オムツ交換')).not.toBeInTheDocument();
  });

  it('詳細リンクのURLが正しいIDを含んでいること', () => {
    render(
      <MemoryRouter>
        <ToiletCard toilet={mockToilet} />
      </MemoryRouter>
    );

    // 「詳細を見る」リンクを取得して、href属性をチェック
    const link = screen.getByRole('link', { name: '詳細を見る' });
    expect(link).toHaveAttribute('href', '/detail/999');
  });
});