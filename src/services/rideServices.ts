import { Op } from 'sequelize';
import { Ride } from "../models/Ride";
import { User } from "../models/User";
import { GroupMember } from "../models/GroupMembers";
import { RideStatusType } from '../@types/model';
import { Location } from "../@types/location";

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
