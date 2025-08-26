import { Country, CountryPair } from '../types';
import { calculateDistance } from '../utils/haversine'
import countriesData from '../../countries_database.json'

const countries: Country[] = (countriesData as any[]).map(country => ({
    id: country.id,
    name: country.name,
    iso3: country.iso3,
    iso2: country.iso2,
    capital: country.capital,
    latitude: country.latitude,
    longitude: country.longitude 
}))

export const getAllCountries = (): Country[] => countries;


export const getCountryByCode = (code: string): Country | undefined => {
    const upperCode = code.toLocaleUpperCase();
    return countries.find(c => c.iso2 === upperCode || c.iso3 === upperCode);
}


export const validateCountryCodes = (codes: string[]): {valid: Country[], invalid: string[]} => {
    const valid: Country[] = [];
    const invalid: string[] = [];

    codes.forEach(code => {
        const country = getCountryByCode(code);
        if(country) valid.push(country);
        else invalid.push(code)
    })

    return {valid,invalid};
}

export const calculateDistancePairs = (countriesList: Country[]): CountryPair[] => {
    const pairs: CountryPair[] = [];

    for(let i = 0; i < countriesList.length; i++){
        for(let j = i + 1; j < countriesList.length; j++) {
            const a = countriesList[i];
            const b = countriesList[j];

            const distance = calculateDistance(
                parseFloat(a.latitude),
                parseFloat(a.longitude),
                parseFloat(b.latitude),
                parseFloat(b.longitude),
            );
            pairs.push({ a: a.iso2, b: b.iso2, km: Math.round(distance * 10) / 10 });
        }
    }

    return pairs;
}

export const calculateDistancePairsWithProgress = async (
  countriesList: Country[],
  onProgress?: (done: number, total: number, latest?: CountryPair) => void
): Promise<CountryPair[]> => {
  const pairs: CountryPair[] = [];
  const totalPairs = (countriesList.length * (countriesList.length - 1)) / 2;
  let completed = 0;

  for (let i = 0; i < countriesList.length; i++) {
    for (let j = i + 1; j < countriesList.length; j++) {
      const a = countriesList[i];
      const b = countriesList[j];
      const distance = calculateDistance(
        parseFloat(a.latitude),
        parseFloat(a.longitude),
        parseFloat(b.latitude),
        parseFloat(b.longitude)
      );

      const pair: CountryPair = { a: a.iso2, b: b.iso2, km: Math.round(distance * 10) / 10 };
      pairs.push(pair);
      completed++;

      if (onProgress) onProgress(completed, totalPairs, pair);

      if (completed % 100 === 0) await new Promise(res => setTimeout(res, 1));
    }
  }

  return pairs.sort((x, y) => x.km - y.km);
};
