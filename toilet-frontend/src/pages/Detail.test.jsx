import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Detail from './Detail';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

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
    // ★ここを修正: URLの末尾に /:id を追加
    server.use(
      http.get('/api/toilets/:id', () => {
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