import Bike from "../models/Bike";
import {
  UNAVAILABLE_PLATE
} from "../utils/constants/constants";

export const filterUser = (user: any) => {
  const { password, ...filteredUser } = user;
  return filteredUser;
}

export const getFirstPlate = (bikes: Bike[]) => {
  return bikes.find(bike => !!bike.plate)?.plate || UNAVAILABLE_PLATE;
};