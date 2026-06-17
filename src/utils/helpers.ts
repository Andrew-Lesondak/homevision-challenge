import { parseAddress } from 'addresser';

import type { House } from './constants';

export const formatDollars = (value: number | null | undefined, decimals = 2) => {
  const normalized = Number(value ?? 0);
  const prefix = normalized < 0 ? '-$' : '$';

  return `${prefix}${Math.abs(normalized).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const buildGoogleMapsSearchUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

export const formatAddress = (address: string) => {
  try {
    const parsed = parseAddress(address);
    const line1 = parsed.addressLine1;
    const line2 = [parsed.placeName, parsed.stateAbbreviation, parsed.zipCode]
      .filter(Boolean)
      .join(' ');

    return {
      label: address,
      line1: line1 || address,
      line2,
      mapsUrl: buildGoogleMapsSearchUrl(address),
      parsed: true,
    };
  } catch {
    return {
      label: address,
      line1: address,
      line2: '',
      mapsUrl: buildGoogleMapsSearchUrl(address),
      parsed: false,
    };
  }
};

export const getHouseImageAlt = (house: House) =>
  `House ${house.id} photo for ${house.homeowner}`;
