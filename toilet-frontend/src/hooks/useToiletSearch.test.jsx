import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToiletSearch } from './useToiletSearch';
import ListPanel from '../pages/Search/ListPanel';

const bounds = { minLat: 35, maxLat: 37, minLng: 139, maxLng: 141 };
const toilet = (id) => ({ id, name: `トイレ${id}`, lat: 36, lng: 140 });
const response = (content, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => ({ content }) });
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};
const renderSearch = (url = '/search?lat=36&lng=140') => renderHook(useToiletSearch, {
  wrapper: ({ children }) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>,
});

describe('useToiletSearch 初回検索', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => vi.restoreAllMocks());

  it('bounds未確定時は広域結果を維持し、確定件数を表示しない', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response([toilet(1), toilet(2)]));
    const { result } = renderSearch();

    await waitFor(() => expect(result.current.filteredToilets).toHaveLength(2));
    expect(result.current.searchStatus).toBe('表示範囲のトイレを検索中...');
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('lat')).toBe('36');
    expect(url.searchParams.get('lng')).toBe('140');
    expect(url.searchParams.get('radius')).toBe('50.0');
    expect(url.searchParams.get('size')).toBe('1000');
  });

  it('bounds検索後は確定件数を表示する', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response([toilet(1)]))
      .mockResolvedValueOnce(response([toilet(2), toilet(3)]));
    const { result } = renderSearch();
    await waitFor(() => expect(result.current.filteredToilets).toHaveLength(1));

    act(() => result.current.setMapBounds(bounds));
    await waitFor(() => expect(result.current.searchStatus).toBe('2件のトイレが見つかりました'));
    const url = new URL(fetchMock.mock.calls[1][0]);
    expect(url.searchParams.get('minLat')).toBe('35');
    expect(url.searchParams.has('radius')).toBe(false);
  });

  it('bounds検索が0件なら既存の0件メッセージを表示する', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response([]));
    const { result } = renderSearch();

    act(() => result.current.setMapBounds(bounds));
    await waitFor(() => expect(result.current.searchStatus)
      .toBe('条件に一致するトイレは見つかりませんでした'));
  });

  it('一覧件数はbounds確定まで取得中と表示する', () => {
    const { rerender } = render(
      <MemoryRouter><ListPanel filteredToilets={[toilet(1)]} currentLocation={{ lat: 36, lng: 140 }} boundsPending /></MemoryRouter>
    );
    expect(screen.getByText(/取得中/)).toBeInTheDocument();
    expect(screen.queryByText(/1件/)).not.toBeInTheDocument();

    rerender(<MemoryRouter><ListPanel filteredToilets={[toilet(1)]} currentLocation={{ lat: 36, lng: 140 }} /></MemoryRouter>);
    expect(screen.getByText(/1件/)).toBeInTheDocument();
  });

  it('API通信失敗時のメッセージを維持する', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response([], false));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderSearch();

    await waitFor(() => expect(result.current.searchStatus)
      .toBe('トイレ情報の取得に失敗しました。通信状況を確認して再試行してください'));
  });

  it('遅れて返った広域応答でbounds結果を上書きしない', async () => {
    const oldRequest = deferred();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(oldRequest.promise)
      .mockResolvedValueOnce(response([toilet(2)]));
    const { result } = renderSearch();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => result.current.setMapBounds(bounds));
    await waitFor(() => expect(result.current.searchStatus).toBe('1件のトイレが見つかりました'));
    expect(result.current.filteredToilets.map(t => t.id)).toEqual([2]);

    await act(async () => { oldRequest.resolve(response([toilet(1)])); });
    expect(result.current.filteredToilets.map(t => t.id)).toEqual([2]);
    expect(result.current.searchStatus).toBe('1件のトイレが見つかりました');
  });

  it('sessionStorageの保存済み件数を初期表示へ復元しない', () => {
    sessionStorage.setItem('imatoilet_loc', JSON.stringify({ lat: 36, lng: 140 }));
    sessionStorage.setItem('imatoilet_status', '700件のトイレが見つかりました');
    const pending = deferred();
    vi.spyOn(globalThis, 'fetch').mockReturnValue(pending.promise);

    const { result } = renderSearch('/search');
    expect(result.current.searchStatus).toBe('表示範囲のトイレを検索中...');
  });
});
