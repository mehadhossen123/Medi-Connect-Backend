import { Router } from "express";

import { userController } from "./user.controller";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router=Router();


router.patch("/profile-image-upload",auth(Role.ADMIN,Role.DOCTOR,Role.PATIENT,Role.SUPER_ADMIN),
    upload.single("ProfileImage")
    ,
    userController.uploadProfileImage)





export const userRoute=router