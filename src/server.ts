import app from "./app";
import http from "http";
import sequelize from "./config/sequelize";
import "./models/associations";
import { initializeWebSocketServer } from "./services/websocketService";

const PORT = process.env.PORT || 9000;

const server = http.createServer(app);

const io = initializeWebSocketServer(server);
(global as any).io = io; // Type assertion to avoid the error

sequelize.sync({ alter: true }).then(() => {
  console.log("Database connected and schema updated");
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
