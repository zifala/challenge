export interface Country {
    id: number;
    name: string;
    iso3: string;
    iso2: string;
    capital: string;
    latitude: string;
    longitude: string;
}

export interface CountryPair {
    a: string;
    b: string;
    km: number;
}

export interface DistanceResponse {
    pairs: CountryPair[];
    count: number;
    unit: string;
}

export interface ProgressMessage {
    done: number;
    total: number;
    latest?: CountryPair;
}

export interface DistanceRequest {
    countries: string[];
}