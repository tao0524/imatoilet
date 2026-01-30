import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom'; // 便利な判定コマンド（toBeInTheDocumentなど）を使えるようにする

describe('Header Component', () => {
  it('ロゴのテキストとアイコンが正しく表示されること', () => {
    // Headerコンポーネントを描画（Routerで包む必要がある）
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // 画面上に指定したテキストが存在するか確認
    expect(screen.getByText('いま')).toBeInTheDocument();
    expect(screen.getByText('トイレ')).toBeInTheDocument();
    expect(screen.getByText('🚽')).toBeInTheDocument();
  });

  it('トップページへのリンクが含まれていること', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // リンク（aタグ）を探し、href属性が "/" であるか確認
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/');
  });
});