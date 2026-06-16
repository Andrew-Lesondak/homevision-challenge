import { useInfiniteQuery } from "@tanstack/react-query";
import { URL } from '../utils/constants';

// export async function fetchJson<T>(url: string): Promise<T> {
//   const response = await fetch(url);

//   if (!response.ok) {
//     throw new Error(`Request failed: ${response.status}`);
//   }

//   return response.json() as Promise<T>;
// }

const fetchSize = 10;

const fetchData = async ({ pageParam }: { pageParam: number })=> {
    const url = `${URL}?page=${pageParam}&per_page=${fetchSize}`;
    console.log(url)
    // TODO: handle per_page query param 
  const response = await fetch(url);

  if (!response.ok) {
    // TODO: instead of throw, we should retry
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

//   const fetchProjects = async ({ pageParam }) => {
//     const res = await fetch('/api/projects?cursor=' + pageParam)
//     return res.json()
//   }

// type Options = {

// }

export const useGetHouses = (queryKey: string[]) => {
// const {
//   fetchNextPage,
//   fetchPreviousPage,
//   hasNextPage,
//   hasPreviousPage,
//   isFetchingNextPage,
//   isFetchingPreviousPage,
//   promise,
//   ...result
// } = useInfiniteQuery({
//   queryKey,
//   queryFn: ({ pageParam }) => fetchPage(pageParam),
//   initialPageParam: 1,
//   ...options,
//   getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
//     lastPage.nextCursor,
//   getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) =>
//     firstPage.prevCursor,
// })
// return useInfiniteQuery({
//   queryKey,
//   queryFn: ({ pageParam }: { pageParam: number }) => fetchPage(pageParam),
//   initialPageParam: 1,
// //   ...options,
// //   getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
// //     lastPage.nextCursor,
// //   getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) =>
// //     firstPage.prevCursor,
//   getNextPageParam: (lastPage) =>
//     lastPage.nextCursor,
//   getPreviousPageParam: (firstPage) =>
//     firstPage.prevCursor,
// })
  return useInfiniteQuery({
    queryKey,
    queryFn: fetchData,
    initialPageParam: 1,
//   getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
//   getNextPageParam: (_lastGroup, groups) => {
//     console.log('_lastGroup and groups: ', _lastGroup, groups);
//     return groups.length;
//   },
  getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
  getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => firstPageParam - 1,
//   getNextPageParam: (lastPage) =>
//     lastPage.nextCursor,
//   getPreviousPageParam: (firstPage) =>
//     firstPage.prevCursor,
  })

//   return useInfiniteQuery<HouseResponse>({
//       queryKey,
    //   queryFn: async ({ pageParam = 0 }) => {
    //     const start = (pageParam as number) * fetchSize
    //     const fetchedData = await fetchData(start, fetchSize) //pretend api call
    //     return fetchedData
    //   },
//       initialPageParam: 0,
//       getNextPageParam: (_lastGroup, groups) => groups.length,
//       refetchOnWindowFocus: false,
//       placeholderData: keepPreviousData,
//     })
}