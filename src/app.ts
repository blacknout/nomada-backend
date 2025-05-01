import express from "express";
import cors from "cors";
import helmet from "helmet";
import { setupSwagger } from "./swagger";
import healthRoute from "./routes/healthRoute";
import userRoutes from "./routes/userRoutes";
import bikeRoutes from "./routes/bikeRoutes";
import bikeMetadataRoutes from "./routes/bikeMetadataRoutes";
import groupRoutes from "./routes/groupRoutes";
import groupMemberRoutes from "./routes/groupMemberRoutes";
import rideRoutes from "./routes/rideRoutes";
import rideStopRoutes from "./routes/rideStopRoutes";
import sosRoutes from "./routes/sosRoutes";
import websocketRoutes from "./routes/websocketRoutes";
import dotenv from "dotenv";
import { requestLogger } from './middleware/logger';

dotenv.config();

const app = express();

setupSwagger(app); 
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(requestLogger);

app.use("/api/", healthRoute);
app.use("/api/user", userRoutes);
app.use("/api/bike", bikeRoutes);
app.use("/api/bike-metadata", bikeMetadataRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/member", groupMemberRoutes);
app.use("/api/ride", rideRoutes);
app.use("/api/stop", rideStopRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/ws", websocketRoutes);

export default app;
