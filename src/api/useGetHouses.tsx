import { useInfiniteQuery } from '@tanstack/react-query';

import { URL, type HouseResponse } from '../utils/constants';

type UseGetHousesParams = {
  page: number;
  perPage: number;
};

const fetchHouses = async ({
  pageParam,
  startPage,
  perPage,
}: {
  pageParam: number;
  startPage: number;
  perPage: number;
}) => {
  const response = await fetch(`${URL}?page=${pageParam}&per_page=${perPage}`);

  if (!response.ok) {
    // When the API runs out of later pages, treat common "no more data" statuses as exhaustion
    // rather than a hard error so infinite scroll can stop naturally without a magic page number.
    if (pageParam > startPage && [204, 404, 410].includes(response.status)) {
      return {
        ok: true,
        houses: [],
      } as HouseResponse;
    }

    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<HouseResponse>;
};

export const getNextHousePageParam = (
  lastPage: HouseResponse,
  lastPageParam: number,
  perPage: number,
) => (lastPage.houses.length < perPage ? undefined : lastPageParam + 1);

export const useGetHouses = ({ page, perPage }: UseGetHousesParams) =>
  useInfiniteQuery({
    queryKey: ['get-houses', page, perPage],
    queryFn: ({ pageParam }) =>
      fetchHouses({ pageParam: pageParam as number, perPage, startPage: page }),
    initialPageParam: page,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      getNextHousePageParam(lastPage, lastPageParam, perPage),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 30_000,
  });
