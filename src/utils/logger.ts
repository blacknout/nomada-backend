import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

export interface TransformableInfo {
  level: string;
  message: unknown;
  [key: string | symbol]: unknown;
}

// Determine the environment
const environment = process.env.NODE_ENV || "development";

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info: TransformableInfo) =>
      `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Console transport with colors for development
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    format
  ),
});

// Create the logger
const logger = winston.createLogger({
  level: environment === "production" ? "info" : "debug",
  levels: logLevels,
  format,
  transports: [consoleTransport],
});

// Add file transports for production
if (environment === "production") {
  logger.add(
    new winston.transports.File({ filename: "logs/error.log", level: "error" })
  );
  logger.add(new winston.transports.File({ filename: "logs/combined.log" }));
}

// HTTP request logger middleware function
// Used separately in middleware/logger.ts

export default logger;
