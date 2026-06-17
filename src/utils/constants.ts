export const URL = 'https://staging.homevision.co/api_project/houses';

export type House = {
    address: string;
    addressLine1?: string;
    placeName?: string;
    stateAbbreviation?: string;
    zipCode?: string;
    homeowner: string;
    id: number;
    photoURL: string;
    price: number;
}

export type Houses = House[];

export type ResponsePage = {
    houses: Houses;
    ok: boolean;
}

export type HouseResponse = {
  houses: House[]
  ok: boolean;
}