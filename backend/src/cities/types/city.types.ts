export interface CityCoords {
  lat: string;
  lon: string;
}

export interface CityFullData {
  id: string;
  name: string;
  coords: CityCoords;
  district: string;
  subject: string;
  population: number;
}
