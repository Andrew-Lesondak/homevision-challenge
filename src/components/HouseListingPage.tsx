import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import homevisionLogo from '../assets/homevision_logo.png';
import { useGetHouses } from '../api/useGetHouses';
import HousesTable from './HousesTable';
import { useToast } from './Toasts/useToast';

function HouseListingPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [retryBanner, setRetryBanner] = useState<{
    phase: 'idle' | 'retrying' | 'success';
    visible: boolean;
  }>({
    phase: 'idle',
    visible: false,
  });

  const { showToast } = useToast();
  const lastErrorMessageRef = useRef<string | null>(null);
  const retryTimersRef = useRef<number[]>([]);

  const query = useGetHouses({ page, perPage });
  const {
    data,
    fetchNextPage,
    error,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = query;

  const stats = useMemo(() => {
    const loaded = data?.pages.reduce((total, current) => total + current.houses.length, 0) ?? 0;
    const pages = data?.pages.length ?? 0;

    return { loaded, pages };
  }, [data?.pages]);

  const handlePageChange = (value: string) => {
    const nextValue = Number.parseInt(value, 10);
    setPage(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1);
  };

  const handlePerPageChange = (value: string) => {
    const nextValue = Number.parseInt(value, 10);
    setPerPage(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 10);
  };

  const clearRetryTimers = useCallback(() => {
    retryTimersRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    retryTimersRef.current = [];
  }, []);

  const fadeOutRetryBanner = useCallback(() => {
    clearRetryTimers();

    setRetryBanner((current) => {
      if (current.phase === 'idle' && !current.visible) {
        return current;
      }

      return { ...current, visible: false };
    });

    const timeoutId = window.setTimeout(() => {
      setRetryBanner({ phase: 'idle', visible: false });
    }, 320);

    retryTimersRef.current.push(timeoutId);
  }, [clearRetryTimers]);

  const showRetryStatus = useCallback(
    (phase: 'success', options?: { autoHideMs?: number; fadeOutAfterMs?: number }) => {
      clearRetryTimers();
      setRetryBanner({ phase, visible: true });

      const autoHideMs = options?.autoHideMs ?? 1200;
      const fadeOutAfterMs = options?.fadeOutAfterMs ?? 320;

      const fadeTimeoutId = window.setTimeout(() => {
        setRetryBanner((current) => ({ ...current, visible: false }));
      }, autoHideMs);

      const resetTimeoutId = window.setTimeout(() => {
        setRetryBanner({ phase: 'idle', visible: false });
      }, autoHideMs + fadeOutAfterMs);

      retryTimersRef.current.push(fadeTimeoutId, resetTimeoutId);
    },
    [clearRetryTimers],
  );

  useEffect(
    () => () => {
      clearRetryTimers();
    },
    [clearRetryTimers],
  );

  useEffect(() => {
    if (!isError || !error) {
      return;
    }

    const message = error instanceof Error ? error.message : 'Something went wrong while fetching houses.';
    const key = `${page}:${perPage}:${message}`;

    if (lastErrorMessageRef.current === key) {
      return;
    }

    // Only surface the terminal failure so the loading row stays the primary retry signal.
    lastErrorMessageRef.current = key;
    showToast({
      action: {
        label: 'Retry',
        onClick: async () => {
          clearRetryTimers();
          setRetryBanner({ phase: 'retrying', visible: true });
          lastErrorMessageRef.current = null;

          const retryResult = await refetch();

          if (retryResult.isError) {
            fadeOutRetryBanner();
            return;
          }

          showRetryStatus('success');
        },
      },
      description: message,
      durationMs: 9000,
      title: 'The API returned an error.',
      tone: 'error',
    });
  }, [
    clearRetryTimers,
    error,
    fadeOutRetryBanner,
    isError,
    page,
    perPage,
    refetch,
    showRetryStatus,
    showToast,
  ]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#edf4ff_100%)] text-slate-900">
      <main className="flex flex-col w-full min-h-screen px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur">
          <div className="px-5 py-5 border-b border-slate-200/80 sm:px-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-4 text-left">
                <img
                  className="w-auto h-12 sm:h-14"
                  src={homevisionLogo}
                  alt="HomeVision"
                />
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Infinite scroll house listings
                  </h1>
                  <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                    Houses load page by page, auto retries flaky responses, and caches earlier results visible so the list can keep growing even when the API has a hiccup.
                  </p>
                </div>
              </div>

              <form
                className="grid gap-3 p-4 text-left border shadow-sm rounded-2xl border-slate-200 bg-slate-50/90 sm:grid-cols-2"
                onSubmit={(event) => event.preventDefault()}
              >
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Start page</span>
                  <input
                    className="w-full px-3 py-2 transition bg-white border shadow-sm outline-none rounded-xl border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    inputMode="numeric"
                    min={1}
                    name="page"
                    onChange={(event) => handlePageChange(event.target.value)}
                    type="number"
                    value={page}
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Per page</span>
                  <input
                    className="w-full px-3 py-2 transition bg-white border shadow-sm outline-none rounded-xl border-slate-300 text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    inputMode="numeric"
                    min={1}
                    name="perPage"
                    onChange={(event) => handlePerPageChange(event.target.value)}
                    type="number"
                    value={perPage}
                  />
                </label>
              </form>
            </div>

            <div className="flex flex-wrap gap-2 mt-5 text-xs font-medium text-slate-600">
              <span className="px-3 py-1 bg-white border rounded-full border-slate-200">
                Loaded {stats.loaded} houses
              </span>
              <span className="px-3 py-1 bg-white border rounded-full border-slate-200">
                {stats.pages} pages in cache
              </span>
              <span className="px-3 py-1 bg-white border rounded-full border-slate-200">
                Results start at page {page} with {perPage} houses per page
              </span>
              {retryBanner.phase !== 'idle' ? (
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 transition-all duration-300 ${
                    retryBanner.phase === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-sky-200 bg-sky-50 text-sky-800'
                  } ${retryBanner.visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}
                >
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      retryBanner.phase === 'success' ? 'bg-emerald-500' : 'bg-sky-500'
                    }`}
                  />
                  {retryBanner.phase === 'success' ? 'Retry succeeded' : 'Retrying request...'}
                </span>
              ) : null}
            </div>
          </div>

          <div className="px-4 py-5 space-y-4 sm:px-7">
            <HousesTable
              data={data}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isLoading={isLoading}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default HouseListingPage;
