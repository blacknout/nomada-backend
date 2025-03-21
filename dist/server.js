"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const app_1 = __importDefault(require("./app"));
const sequelize_1 = __importDefault(require("./config/sequelize"));
const PORT = process.env.PORT || 3000;
console.log((0, express_list_endpoints_1.default)(app_1.default));
sequelize_1.default.sync({ force: false }).then(() => {
    console.log("Database connected");
    app_1.default.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
