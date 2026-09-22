import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// 地図(Google Maps)はjsdomで読み込めないため、クリックで座標を確定させる最小限のモックに置き換える
vi.mock('../components/SafeGoogleMap', () => ({
  SafeGoogleMap: ({ onClick, children }) => (
    <div
      data-testid="mock-map"
      onClick={() => onClick({ latLng: { lat: () => 36.08, lng: () => 140.11 } })}
    >
      {children}
    </div>
  ),
}));

const fillAndSubmit = () => {
  fireEvent.click(screen.getByTestId('mock-map'));
  fireEvent.change(screen.getByPlaceholderText('例：つくば駅前公衆トイレ'), {
    target: { value: 'テストトイレ' },
  });
  fireEvent.click(screen.getByLabelText('公園・屋外'));
  fireEvent.click(screen.getByRole('button', { name: /登録する/ }));
};

describe('Register Page', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('409応答時、50m以内重複の専用メッセージが表示されること', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: '50m以内に既存のトイレ（ID: 123）があります', existingToiletId: 123 }),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fillAndSubmit();

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('50m以内に既に登録されているトイレがあります。')
    );
  });

  it('400応答時は従来通り入力エラーメッセージが表示されること', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: '名前は必須です' }),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fillAndSubmit();

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('入力エラー:\n名前は必須です')
    );
  });

  it('500応答時は従来通りサーバーエラーメッセージが表示されること', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fillAndSubmit();

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('登録に失敗しました。サーバーエラーです。')
    );
  });
});
