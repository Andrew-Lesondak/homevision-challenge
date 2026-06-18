import type { Meta, StoryObj } from '@storybook/react-vite';

import { HousePhoto } from './HousePhoto';

const meta = {
  title: 'Components/HousePhoto',
  component: HousePhoto,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof HousePhoto>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    house: {
      id: 42,
      homeowner: 'Jane Doe',
      address: '123 Main St, Austin, TX 78701',
      photoURL:
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      price: 845000,
    },
  },
};

export const MissingImage: Story = {
  args: {
    house: {
      id: 43,
      homeowner: 'Alex Rivera',
      address: '456 Oak Ave, Denver, CO 80202',
      photoURL: '',
      price: 655000,
    },
  },
};
