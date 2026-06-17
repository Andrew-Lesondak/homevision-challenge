export const URL = 'https://staging.homevision.co/api_project/houses';

export type House = {
  address: string;
  homeowner: string;
  id: number;
  photoURL: string;
  price: number;
};

export type Houses = House[];

export type HouseResponse = {
  houses: House[];
  ok: boolean;
};
