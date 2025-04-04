import { Request, Response } from "express";
import { Ride } from "../models/Ride";
import { User } from "../models/User";

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

