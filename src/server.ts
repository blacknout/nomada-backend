import app from "./app";
import http from "http";
import "./models/associations";
import { initializeWebSocketServer } from "./services/websocketService";
import logger from "./utils/logger";
import sequelize from "./config/sequelize";
import { runMigrations } from "./migrations/migrations";


const PORT = process.env.PORT || 9000;

const server = http.createServer(app);

const io = initializeWebSocketServer(server);
(global as any).io = io;

sequelize.sync({ force: false }).then(() => {
  logger.info("Database connected successfully");
  server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
})
.catch((error: any) => {
  logger.error("Error connecting to database:", error);
});

if (require.main === module) {
  (async () => {
    try {
      await runMigrations();
    } catch (error) {
      console.error(error);
    }
  })();
}
