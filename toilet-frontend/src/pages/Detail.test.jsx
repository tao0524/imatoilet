import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Detail from './Detail';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';        // 追加
import { server } from '../mocks/server';        // 追加

describe('Detail Page', () => {
  it('APIからデータを取得して詳細が表示されること', async () => {
    render(
      <MemoryRouter initialEntries={['/detail/1']}>
        <Routes>
          <Route path="/detail/:id" element={<Detail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    const titleElement = await screen.findByText('つくば駅前公衆トイレ（テスト用）');
    
    expect(titleElement).toBeInTheDocument();
    expect(screen.getByText('茨城県つくば市吾妻1-1')).toBeInTheDocument();
    expect(screen.getByText('車椅子OK')).toBeInTheDocument();
  });

  it('APIエラー時にエラーメッセージが表示されること', async () => {
    // このテストの間だけ、APIがエラー(500)を返すように設定を上書き
    server.use(
      http.get('http://localhost:8080/api/toilets', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(
      <MemoryRouter initialEntries={['/detail/999']}>
        <Routes>
          <Route path="/detail/:id" element={<Detail />} />
        </Routes>
      </MemoryRouter>
    );

    // エラー発生後、「データが見つかりませんでした」が表示されるのを待つ
    const errorMsg = await screen.findByText('データが見つかりませんでした。');
    expect(errorMsg).toBeInTheDocument();
  });
});