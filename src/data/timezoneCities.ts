import cityTimezones from 'city-timezones';

export interface CityTimezone {
  city: string;
  country: string;
  province?: string;
  stateAnsi?: string;
  timezone: string;
  population: number;
}

const ALL_CITIES: CityTimezone[] = cityTimezones.cityMapping
  .map((c) => ({
    city: c.city,
    country: c.country,
    province: c.province || undefined,
    stateAnsi: c.state_ansi || undefined,
    timezone: c.timezone,
    population: c.pop || 0,
  }))
  .filter((c) => !!c.timezone)
  .sort((a, b) => b.population - a.population);

// The most populous city for each IANA zone, used as a human-readable label for that zone.
const ZONE_TO_TOP_CITY = new Map<string, CityTimezone>();
for (const c of ALL_CITIES) {
  if (!ZONE_TO_TOP_CITY.has(c.timezone)) {
    ZONE_TO_TOP_CITY.set(c.timezone, c);
  }
}

/** Searches the bundled offline city dataset by city, province/state, or country name. */
export function searchCities(query: string, limit = 40): CityTimezone[] {
  const q = query.trim().toLowerCase();

  if (!q) {
    // No query yet: surface one representative (most populous) city per zone for browsing.
    return Array.from(ZONE_TO_TOP_CITY.values())
      .sort((a, b) => b.population - a.population)
      .slice(0, limit);
  }

  const results: CityTimezone[] = [];
  for (const c of ALL_CITIES) {
    if (
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.province && c.province.toLowerCase().includes(q)) ||
      (c.stateAnsi && c.stateAnsi.toLowerCase() === q) ||
      c.timezone.toLowerCase().includes(q)
    ) {
      results.push(c);
      if (results.length >= limit) break;
    }
  }
  return results;
}

/** A human-readable label for an IANA zone, e.g. "Dallas, TX" or "Mumbai, India". */
export function getZoneLabel(timezone: string): string {
  const top = ZONE_TO_TOP_CITY.get(timezone);
  if (!top) return timezone;
  if (top.stateAnsi && top.country === 'United States of America') {
    return `${top.city}, ${top.stateAnsi}`;
  }
  return `${top.city}, ${top.country}`;
}
