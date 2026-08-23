import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, type Application, type Request, type Response } from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";

import { client } from "./app/lib/redis";
import crypto from "crypto"
import { date } from "zod";


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

// Basic route
app.get("/", async (req: Request, res: Response) => {


	try {

		const otp=crypto.randomInt(100000,1000000)
		 await client.set("forgot-password-otp:patine1@gmail.com", "123456", {
       expiration: {
         type: "EX",
         value: 60,
       },
     });

	 res.status(httpStatus.OK).json({
     success: true,
     message: "Welcome to PH Healthcare System Backend",
     data: otp,
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
