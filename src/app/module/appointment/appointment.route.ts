import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { appointmentController } from "./appointment.controller";

const router=Router();
// auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN);


router.post("/book-appointment",appointmentController.bookAppointment)
router.get("/book-appointment/payment/callback",()=>{});





export const appointmentRoute=router