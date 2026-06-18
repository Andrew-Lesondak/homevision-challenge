import type { Meta, StoryObj } from '@storybook/react-vite';

import { Loader } from './Loader';

const meta = {
  title: 'Components/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Loader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Loading',
  },
};

export const Compact: Story = {
  args: {
    label: 'Loading more houses',
    compact: true,
  },
};
