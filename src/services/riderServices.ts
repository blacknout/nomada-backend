import { Request, Response } from "express";
import { Op } from 'sequelize';
import { Ride } from "../models/Ride";
import { User } from "../models/User";
import { GroupMember } from "../models/GroupMembers";
import { RideStatusType } from '../@types/model';


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

export const startRide = async(ride: Ride, status: RideStatusType) => {
  try {
    const ongoingRide = await Ride.findOne({
      where: {
        groupId: ride.groupId,
        status: "started"
      }
    });
    if (ongoingRide) return { 
      status: 400, 
      message: "You cannot start a new ride when another ride in this group is ongoing" 
    };
    const groupMembers = await GroupMember.findAll({
      where: {
        groupId: ride.groupId,
        type: {
          [Op.or]: ["active", "ghost"],
        }
      }
    });
    groupMembers.map(async(member) => {
      await (ride as any).addParticipant(member.userId)
    });
    ride.status = status;
    await ride.save();
    return;
  } catch (err) {
    return err;
  }
}
