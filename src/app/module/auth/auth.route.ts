import {  Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth, zodValidationRequest } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";
import { patientZodValidation } from "./auth.validation";

const router = Router();

router.post("/register",
	zodValidationRequest(patientZodValidation.UserRegisterZodSchema)
// 	 (req:Request,res:Response,next:NextFunction)=>{

// 	try {

// 		const payload=req.body;
// 		const result=patientZodValidation.UserRegisterZodSchema.safeParse(payload)
// 		if (!result.success) {
//       throw new Error(result.error.issues[0].message);
//     }

// 	req.body=result.data



		
// 	} catch (error) {
// 		next(error)
		
// 	}
// 	next()

// }
,AuthController.registerPatient);
router.post("/login", AuthController.loginUser);
router.get(
	"/me",
	auth(Role.ADMIN, Role.DOCTOR, Role.PATIENT, Role.SUPER_ADMIN),
	AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/google",AuthController.googleLogin)
router.post("/forgot-password",zodValidationRequest(patientZodValidation.forgotPasswordZodSchema),AuthController.forgotPassword)
router.post("/reset-password",zodValidationRequest(patientZodValidation.resetPasswordZodSchema),AuthController.resetPassword)

export const AuthRoutes = router;
