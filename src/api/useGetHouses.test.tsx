import { type PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/dom';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getNextHousePageParam, useGetHouses } from './useGetHouses';

const API_URL = 'https://staging.homevision.co/api_project/houses';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
};

const createJsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

describe('useGetHouses', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requests the configured page and loads additional pages', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse({
          ok: true,
          houses: [{ id: 1, address: '1 Main St', homeowner: 'A', photoURL: '', price: 100 }],
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          ok: true,
          houses: [{ id: 2, address: '2 Main St', homeowner: 'B', photoURL: '', price: 200 }],
        }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useGetHouses({ page: 2, perPage: 1 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}?page=2&per_page=1`);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}?page=3&per_page=1`);
    expect(result.current.data?.pages).toHaveLength(1);
  });

  it('stops paginating when the API returns fewer rows than requested', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      createJsonResponse({
        ok: true,
        houses: [{ id: 1, address: '1 Main St', homeowner: 'A', photoURL: '', price: 100 }],
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useGetHouses({ page: 1, perPage: 2 }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('computes the next page only when the API returns a full page', () => {
    expect(
      getNextHousePageParam(
        {
          ok: true,
          houses: [{ id: 1, address: '1 Main St', homeowner: 'A', photoURL: '', price: 100 }],
        },
        2,
        1,
      ),
    ).toBe(3);

    expect(
      getNextHousePageParam(
        {
          ok: true,
          houses: [{ id: 1, address: '1 Main St', homeowner: 'A', photoURL: '', price: 100 }],
        },
        2,
        2,
      ),
    ).toBeUndefined();
  });
});
