import * as express from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserPayload } from "./userPayload"; 

declare module "express-serve-static-core" {
  interface Request {
    user?: UserPayload;
  }
}
