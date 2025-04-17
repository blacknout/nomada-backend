export interface RideStopPayload {
  action: string;
  reason: string;
  location: object;
  isResolved: boolean;
  sos: boolean;
}

export interface RideUpdatePayload {
  latitude: number,
  longitude: number,
  altitude: number | null,
  accuracy: number,
  altitudeAccuracy: number | null,
  heading: number | null,
  speed: number | null
}