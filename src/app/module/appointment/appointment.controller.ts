import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"
import { appointmentService } from "./appointment.service";

const bookAppointment = catchAsync(async (req: Request, res: Response) => {
  
  const result=await appointmentService.bookAppointment()


  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Profile updated successfully",
    data:result,
  });
});

const bookAppointmentCallBackUrl = catchAsync(async (req: Request, res: Response) => {
   
  
  const { executedPaymentResult, redirectUrl } =
    await appointmentService.bookAppointmentCallbackUrl(req.query);

    res.redirect(redirectUrl)

    console.log(executedPaymentResult)


  
});


export const appointmentController={
    bookAppointment,
    bookAppointmentCallBackUrl
}
