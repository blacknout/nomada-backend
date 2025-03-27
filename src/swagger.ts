import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import dotenv from "dotenv";

dotenv.config();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bike Ride API",
      version: "1.0.0",
      description: "API documentation for the bike ride tracking system",
    },
    servers: [
      {
        url: `${process.env.CLIENT_ORIGIN}`,
        description: `${process.env.NODE_ENV == "development" ? "Local server" : "Runtime Environment"}`,
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};
const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger docs available at ${process.env.CLIENT_ORIGIN}/api-docs`);
};
