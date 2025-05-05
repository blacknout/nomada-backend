import { Op } from "sequelize";
import { User } from "../models/User";
import { Bike } from "../models/Bike";

export const mergeUsersAndBikeOwners = (users: User[], bikes: Bike[]): User[] => {
  const userMap = new Map<string, User>();

  users.forEach(user => {
      userMap.set(user?.id, user);
  });

  bikes.forEach(bike => {
    if ((bike as any).owner) {
      userMap.set((bike as any).owner.id, (bike as any).owner);
    }
  });

  return Array.from(userMap.values());
};

export const searchUser = async (search: string) => {
  try {
    const searchUser = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${search}%` } },
          { firstname: { [Op.iLike]: `%${search}%` } },
          { lastname: { [Op.iLike]: `%${search}%` } },
        ],
      },
      attributes: ["id", "username", "firstname", "lastname"],
    })
    return searchUser;
  } catch (err) {
    throw new Error(err as string)
  }
};

export const searchBike = async(search: string) => {
  try {
    const searchBike = await Bike.findAll({
      where: { plate: { [Op.iLike]: `%${search}%` } },
      include: [
        {
          model: User,
          attributes: ["id", "username", "firstname", "lastname"],
          as: "owner",
        },
      ],
    })
    return searchBike;
  } catch (err) {
    throw new Error(err as string)
  }
};

export const searchBikeVin = async(vin: string) => {
  try {
    const searchBike = await Bike.findOne({
      where: {
        vin
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "firstname", "lastname"],
          as: "owner",
        },
      ],
    });
    return searchBike;
  } catch (err) {
    throw new Error(err as string)
  }
};