import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, type Application, type Request, type Response } from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";



import { userRoute } from "./app/module/user/user.route";
import { getBkashIdToken } from "./app/lib/bkash";
import { appointmentRoute } from "./app/module/appointment/appointment.route";



const app: Application = express();

app.use(
	cors({
		origin: config.frontend_url,
		credentials: true,
	}),
);


// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/user",userRoute)
app.use("/api/v1/appointment",appointmentRoute)

// Basic route
app.get("/", async (req: Request, res: Response) => {


	try {

		const result=await getBkashIdToken();
		console.log(result)

	 res.status(httpStatus.OK).json({
     success: true,
     message: "Welcome to PH Healthcare System Backend",
     data: null,
   });
		
	} catch (error) {
		console.log(error,"error form server.ts file")
		
	}
	
});


// Redis route 



// ***Exploring zod validation 

// app.post("/zod", async (req: Request, res: Response,next:NextFunction) => {



// try {
// 	const UserZodSchema = z.object({
//     name: z.string().optional(),
//     age: z.number().optional(),
//     isVerified: z.boolean().optional(),
//     books: z.array(z.string()).optional(),
//   });

//   const payload = req.body;

//   const result = UserZodSchema.parse(payload);

//   console.log(result)


	
// } catch (error) {
// 	console.log(error)
// 	next(error)
// }
// 	res.status(httpStatus.OK).json({
// 		success: true,
// 		message: "Welcome to PH Healthcare System Backend",
// 	});
// });

app.use(globalErrorHandler);
app.use(notFound);

export default app;
