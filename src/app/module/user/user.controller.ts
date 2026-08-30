import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { userService } from "./user.service";
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
const uploadProfileImage = catchAsync(async (req: Request, res: Response) => {
  const buffer = req.file?.buffer;
 
  if (!buffer) {
    throw new Error("No file uploaded");
  }
  const userId=req.user?.userId

 const result= await userService.uploadProfileImage(buffer,userId as string);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Profile updated successfully",
    data:result,
  });
});

export const userController = {
  uploadProfileImage,
};
