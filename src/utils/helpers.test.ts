import { describe, expect, it } from 'vitest';

import { buildGoogleMapsSearchUrl, formatAddress, formatDollars } from './helpers';

describe('helper formatting', () => {
  it('formats dollars consistently', () => {
    expect(formatDollars(1234.5)).toBe('$1,234.50');
    expect(formatDollars(-89)).toBe('-$89.00');
    expect(formatDollars(undefined)).toBe('$0.00');
  });

  it('builds a Google Maps search url', () => {
    expect(buildGoogleMapsSearchUrl('123 Main St, Austin, TX')).toBe(
      'https://www.google.com/maps/search/?api=1&query=123%20Main%20St%2C%20Austin%2C%20TX',
    );
  });

  it('falls back safely when an address cannot be parsed', () => {
    const result = formatAddress('not an address');

    expect(result.parsed).toBe(false);
    expect(result.line1).toBe('not an address');
    expect(result.line2).toBe('');
    expect(result.mapsUrl).toContain('not%20an%20address');
  });
});
