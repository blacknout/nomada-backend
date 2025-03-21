"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RideStop = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
const Ride_1 = require("./Ride");
const User_1 = require("./User");
class RideStop extends sequelize_1.Model {
}
exports.RideStop = RideStop;
RideStop.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    rideId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: Ride_1.Ride, key: "id" },
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: User_1.User, key: "id" },
    },
    reason: {
        type: sequelize_1.DataTypes.ENUM("rest", "accident", "mechanical_fault"),
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    isResolved: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize: sequelize_2.default,
    modelName: "RideStop",
    tableName: "ride_stops",
});
