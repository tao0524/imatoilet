import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

describe('Home Page', () => {
  it('メインのキャッチコピーが表示されること', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // テキストの一部だけで検索する場合は正規表現（/text/）を使うと便利です
    expect(screen.getByText(/困った“いま”に/)).toBeInTheDocument();
    expect(screen.getByText(/いちばん近いトイレ/)).toBeInTheDocument();
  });

  it('「近くのトイレを探す」ボタンがあり、検索ページへリンクしていること', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // 特定のテキストを持つリンクを探す
    const searchLink = screen.getByRole('link', { name: /近くのトイレを探す/i });
    
    // リンク先が正しいか確認
    expect(searchLink).toHaveAttribute('href', '/search');
  });

  it('「トイレを登録する」ボタンがあり、登録ページへリンクしていること', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const registerLink = screen.getByRole('link', { name: /トイレを登録する/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});