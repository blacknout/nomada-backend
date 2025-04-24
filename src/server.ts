import app from "./app";
import http from "http";
import sequelize from "./config/sequelize";
import "./models/associations";
import { initializeWebSocketServer } from "./services/websocketService";

const PORT = process.env.PORT || 9000;

const server = http.createServer(app);

const io = initializeWebSocketServer(server);
(global as any).io = io;

sequelize.sync({ force: false }).then(() => {
  console.log("Database connected");
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
