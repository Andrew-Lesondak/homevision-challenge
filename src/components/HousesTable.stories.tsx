import type { InfiniteData } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import HousesTable from './HousesTable';
import type { HouseResponse } from '../utils/constants';

const sampleData: InfiniteData<HouseResponse, unknown> = {
  pageParams: [1],
  pages: [
    {
      ok: true,
      houses: [
        {
          address: '123 Main St, Austin, TX 78701',
          homeowner: 'Jane Doe',
          id: 42,
          photoURL:
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          price: 845000,
        },
        {
          address: '456 Oak Ave, Denver, CO 80202',
          homeowner: 'Alex Rivera',
          id: 43,
          photoURL:
            'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
          price: 655000,
        },
        {
          address: '789 Pine St, Portland, OR 97205',
          homeowner: 'Sam Lee',
          id: 44,
          photoURL:
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
          price: 912500,
        },
      ],
    },
  ],
};

const meta = {
  title: 'Components/HousesTable',
  component: HousesTable,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HousesTable>;

export default meta;

type Story = StoryObj<typeof meta>;
type HousesTableProps = ComponentProps<typeof HousesTable>;

const noopFetchNextPage: HousesTableProps['fetchNextPage'] = async () =>
  Promise.resolve({
    data: sampleData,
    error: null,
    failureCount: 0,
    failureReason: null,
    fetchStatus: 'idle',
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isFetchingNextPage: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isSuccess: true,
    hasNextPage: false,
    hasPreviousPage: false,
    isFetchingPreviousPage: false,
    status: 'success',
  } as never);

export const Loaded: Story = {
  args: {
    data: sampleData,
    fetchNextPage: noopFetchNextPage,
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  },
};

export const LoadingMore: Story = {
  args: {
    data: sampleData,
    fetchNextPage: noopFetchNextPage,
    hasNextPage: true,
    isFetchingNextPage: true,
    isLoading: false,
  },
};

export const Empty: Story = {
  args: {
    data: {
      pageParams: [1],
      pages: [
        {
          ok: true,
          houses: [],
        },
      ],
    },
    fetchNextPage: noopFetchNextPage,
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  },
};
