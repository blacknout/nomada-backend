export interface Location {
  latitude: number;
  longitude: number;
  address?: string | null;
}

export interface DirectionsResult {
  coordinates: Location[];
  distance: string;
  duration: string;
  bounds: {
    northeast: { latitude: number; longitude: number };
    southwest: { latitude: number; longitude: number };
  };
}