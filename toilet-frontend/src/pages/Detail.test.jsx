import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Detail from './Detail';
import { describe, it, expect } from 'vitest';

describe('Detail Page', () => {
  it('APIからデータを取得して詳細が表示されること', async () => {
    // 1. 仮想的に「/detail/1」のURLでコンポーネントを表示します
    render(
      <MemoryRouter initialEntries={['/detail/1']}>
        <Routes>
          {/* URLパラメータ :id を受け取るための設定 */}
          <Route path="/detail/:id" element={<Detail />} />
        </Routes>
      </MemoryRouter>
    );

    // 2. 最初は「読み込み中...」と表示されていることを確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    // 3. API（モック）からデータが届き、画面が変わるのを待ちます
    // findByText は「要素が現れるまで待つ」機能があります
    const titleElement = await screen.findByText('つくば駅前公衆トイレ（テスト用）');
    
    // 4. データが正しく表示されたか検証
    expect(titleElement).toBeInTheDocument();
    expect(screen.getByText('茨城県つくば市吾妻1-1')).toBeInTheDocument(); // 住所
    expect(screen.getByText('車椅子OK')).toBeInTheDocument(); // タグ
  });
});