import axios from 'axios';
import { Ride } from "../models/Ride";
import { User } from "../models/User";
import { RideStatusType } from '../@types/model';
import { Location, DirectionsResult } from "../@types/location";
import { decodePolyline } from '../utils/handleData';
import { calculateDistance } from '../utils/calc';

/**
 * Get a user's ride history with pagination
 * @param {string} userId - The user's ID
 * @param {number} page - Current page for rides
 * @param {number} limit - Items per page for rides
 */
export const getUserRideHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 5
) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows: rides } = await Ride.findAndCountAll({
      include: [
        {
          model: User,
          as: "participants",
          through: { attributes: [] },
          where: { id: userId },
          attributes: ["id", "username", "firstname", "lastname"]
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      rides,
    };
  } catch (error) {
    throw new Error(`Error fetching ride history: ${error}`);
  }
};

export const createRideName = (groupName: string) => {
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedDate = dateFormatter.format(now);
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const formattedTime = timeFormatter.format(now);
  return `${groupName} ride on ${formattedDate} ${formattedTime}`;
}

export const handleRideStatus = async(id: string, ride: Ride, status: RideStatusType, location: Location) => {
  const group = (ride as any).rideGroup;
  const isAdmin = group?.groupAdmins?.some(
    (admin: any) => admin.id === id);
  if (ride.createdBy === id ||
     ride.roadCaptainId === id ||
     isAdmin) {
    ride.startLocation = location;
    ride.status = status;
    await ride.save();
    return {
      status: 200,
      message: "Ride status updated successfully.", 
      ride,
    };
  } else {
    return {
      status: 403,
      message: "You are not allowed to update the status of this ride."
    }
  }
}

export const handleSaveRideRoute = async (ride: Ride, route: Location[]) => {
  try {
    ride.route = route;
    await ride.save();
    return {
      status: 200,
      message: "Ride route saved successfully.",
      ride,
    };
  } catch (error) {
    throw new Error(`Error saving ride route: ${error}`);
  }
}

export const getAllGroupRides = async (
  groupId: string,
  page: number = 1,
  limit: number = 5
) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows: rides } = await Ride.findAndCountAll({
      where: { groupId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      rides,
    };
  } catch (error) {
    throw new Error(`Error fetching ride history: ${error}`);
  }
};

export const getDirections = async (
  origin: Location,
  destination: Location,
  options?: {
    mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
    alternatives?: boolean;
    optimize?: boolean;
    waypoints?: Location[];
  }
): Promise<DirectionsResult | null> => {
  try {
    // Try both possible environment variable names
    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('No Google Maps API key provided');
      return null;
    }

    const waypointsParam = options?.waypoints
      ? `&waypoints=${options.waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|')}`
      : '';

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${origin.latitude},${origin.longitude}` +
      `&destination=${destination.latitude},${destination.longitude}` +
      `&mode=${options?.mode || 'driving'}` +
      `&alternatives=${options?.alternatives ?? false}` +
      `&optimize=${options?.optimize ?? true}` +
      `&units=metric` +
      waypointsParam +
      `&key=${GOOGLE_MAPS_API_KEY}`
    );
  console.log("🚀 ~ useDirections ~ response.data:", response.data)

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const points = route.overview_polyline.points;
      const decodedCoordinates = decodePolyline(points);
      
      return {
        coordinates: decodedCoordinates,
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        bounds: {
          northeast: {
            latitude: route.bounds.northeast.lat,
            longitude: route.bounds.northeast.lng
          },
          southwest: {
            latitude: route.bounds.southwest.lat,
            longitude: route.bounds.southwest.lng
          }
        }
      };
    }

    console.warn('No route found:', response.data.status);
    return null;
  } catch (error) {
    console.error('Error fetching directions:', error);
    return null;
  }
};

export const generateMockRoute = (
  origin: Location,
  destination: Location
): DirectionsResult => {
  const numPoints = 10;
  const mockRoute: Location[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    mockRoute.push({
      latitude: origin.latitude + (destination.latitude - origin.latitude) * fraction,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * fraction
    });
  }

  // Calculate rough distance in kilometers
  const distance = calculateDistance(origin, destination);
  
  return {
    coordinates: mockRoute,
    distance: `${Math.round(distance)} km`,
    duration: 'N/A',
    bounds: {
      northeast: {
        latitude: Math.max(origin.latitude, destination.latitude),
        longitude: Math.max(origin.longitude, destination.longitude)
      },
      southwest: {
        latitude: Math.min(origin.latitude, destination.latitude),
        longitude: Math.min(origin.longitude, destination.longitude)
      }
    }
  };
};
