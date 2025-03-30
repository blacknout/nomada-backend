import express from "express";
import cors from "cors";
import helmet from "helmet";
import "./models/associations";
import { setupSwagger } from "./swagger";
import healthRoute from "./routes/healthRoute";
import userRoutes from "./routes/userRoutes";
import bikeRoutes from "./routes/bikeRoutes";
import groupRoutes from "./routes/groupRoutes";
import groupMemberRoutes from "./routes/groupMemberRoutes";
import rideRoutes from "./routes/rideRoutes";
import rideStopRoutes from "./routes/rideStopRoutes";
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
app.use("/api/group", groupRoutes);
app.use("/api/member", groupMemberRoutes);
app.use("/api/ride", rideRoutes);
app.use("/api/stop", rideStopRoutes);

export default app;
