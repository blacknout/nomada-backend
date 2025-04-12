import express from "express";
import { 
  createSosContact,
  updateSosContact,
  getSosContact,
  contactSos
} from "../controllers/sosController";
import { 
  validateUserQuery
} from "../middleware/userValidation";
import {
  validateSosInputs
} from "../middleware/sosValidation";
import { authenticateUser } from '../middleware/auth'

const router = express.Router();


router.post("/", authenticateUser, validateSosInputs, createSosContact);


router.put("/", authenticateUser, validateSosInputs, updateSosContact);



router.get("/", authenticateUser, getSosContact);



router.post("/contact", authenticateUser, validateSosInputs, contactSos);


export default router;