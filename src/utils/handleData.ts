import Bike from "../models/Bike";
import User from "../models/User";
import { Location } from "../@types/location";

import {
  UNAVAILABLE_PLATE
} from "../utils/constants/constants";

export const filterUser = (user: User) => {
  const { password, ...filteredUser } = user;
  return filteredUser;
}

export const getFirstPlate = (bikes: Bike[]) => {
  return bikes.find(bike => !!bike.plate)?.plate || UNAVAILABLE_PLATE;
};

// Utility function to decode Google's encoded polyline
export const decodePolyline = (encoded: string): Location[] => {
  const points: Location[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let shift = 0;
    let result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result & 0x20);

    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result & 0x20);

    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({
      latitude: lat * 1e-5,
      longitude: lng * 1e-5
    });
  }

  return points;
};