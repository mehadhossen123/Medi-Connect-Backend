import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import z from "zod";

declare global {
	namespace Express {
		interface Request {
			user?: {
				email: string;
				name: string;
				userId: string;
				role: Role;
			};
		}
	}
}

// auth(Role.ADMIN, Role.USER, Role.Author)
// auth() => ...requiredRoles => [Role.ADMIN, Role.USER, Role.AUTHOR]
export const auth = (...requiredRoles: Role[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token = req.cookies.accessToken
			? req.cookies.accessToken
			: req.headers.authorization?.startsWith("Bearer ")
				? req.headers.authorization?.split(" ")[1]
				: req.headers.authorization;

		if (!token) {
			throw new Error(
				"You are not logged in. Please log in to access this resource.",
			);
		}

		const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

		if (!verifiedToken.success) {
			throw new Error(verifiedToken.error);
		}

		const { email, name, userId, role } = verifiedToken.data as JwtPayload;

		if (requiredRoles.length && !requiredRoles.includes(role)) {
			throw new Error(
				"Forbidden. You don't have permission to access this resource.",
			);
		}

		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				email,
				name,
				role,
			},
		});

		if (!user) {
			throw new Error("User not found. Please log in again.");
		}

		if (user.status === "BLOCKED") {
			throw new Error("Your account has been blocked. Please contact support.");
		}

		req.user = {
			email,
			name,
			userId,
			role,
		};

		next();
	});
};


// validation request 
export const zodValidationRequest=(zodSchema:z.ZodObject)=>{
	return catchAsync((req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      const result =
        zodSchema.safeParse(payload);
      if (!result.success) {
        throw new Error(result.error.issues[0].message);
      }

      req.body = result.data;
    } catch (error) {
      next(error);
    }
    next();
  });
}
