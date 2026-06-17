import { useInfiniteQuery } from '@tanstack/react-query';

import { URL, type HouseResponse } from '../utils/constants';

type UseGetHousesParams = {
  page: number;
  perPage: number;
};

const fetchHouses = async ({
  pageParam,
  perPage,
}: {
  pageParam: number;
  perPage: number;
}) => {
  const response = await fetch(`${URL}?page=${pageParam}&per_page=${perPage}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<HouseResponse>;
};

export const useGetHouses = ({ page, perPage }: UseGetHousesParams) =>
  useInfiniteQuery({
    queryKey: ['get-houses', page, perPage],
    queryFn: ({ pageParam }) =>
      fetchHouses({ pageParam: pageParam as number, perPage }),
    initialPageParam: page,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.houses.length < perPage ? undefined : lastPageParam + 1,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30_000,
  });
