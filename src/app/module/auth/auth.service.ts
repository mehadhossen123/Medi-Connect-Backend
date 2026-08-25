/** biome-ignore-all lint/style/useConst: <explanation> */
import bcrypt from "bcryptjs";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { AuthProvider, Role, UserStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import path from "path"
import { jwtUtils } from "../../utils/jwt";
import ejs from "ejs"
import type {
	IForgotPasswordPayload,
	IGoogleLoginPayload,
	ILoginUserPayload,
	IRegisterPatientPayload,
	IRequestUser,
	IResetPasswordPayload,
} from "./auth.interface";

import { googleClient } from "../../lib/googleAuth";
import { TokenPayload } from "google-auth-library";
import crypto from "crypto"
import { client } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";

const registerPatient = async (payload: IRegisterPatientPayload) => {
	const { name, password } = payload;
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 8);
	// 

	const createdUser = await prisma.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
			role: Role.PATIENT,
			status: UserStatus.ACTIVE,
			emailVerified: false,
			patient: {
				create: { name, email },
			},
		},
		omit: { password: true },
		include: { patient: true },
	});

	const { patient, ...user } = createdUser;
	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		user,
		patient,
		accessToken,
		refreshToken,
	};
};

const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted");
	}
	if(user.password==null && user.googleId!==null){
		throw new Error("User already exist! Registered with google . please try to google login ")
	}

	const isPasswordMatched = await bcrypt.compare(password, user.password as string);

	if (!isPasswordMatched) {
		throw new Error("Invalid credentials");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const getMe = async (user: IRequestUser) => {
	const isUserExists = await prisma.user.findUnique({
		where: {
			id: user.userId,
		},
		include: {
			patient: true,
		},
		omit: {
			password: true,
		},
	});

	if (!isUserExists) {
		throw new Error("User not found");
	}

	return isUserExists;
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
		throw new Error("User is inactive or not found");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};





const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googlePayload:TokenPayload|null|undefined=null
	

	try {
	  const loginTicket = await googleClient.verifyIdToken({
      idToken: payload.idToken,
      audience: config.google_client_id,
      });
	  googlePayload = loginTicket.getPayload();
		
	} catch (error) {
		console.log("google id verification error",error)
		throw new Error("Invalid or expired id token")
		
	}

	if(!googlePayload){
		throw new Error("Invalid or expired id token");
		
	}
	if(!googlePayload.email){
		throw new Error("Google email doesn't found");
		
	}
	if(!googlePayload.name){
		throw new Error("Google email doesn't found");
		
	}

	// check database if current user is exit or not 
	const isPatientExistInDbWithGoogleAuth=await prisma.user.findUnique({
		where:{
			email:googlePayload.email,
			role:Role.PATIENT,
			googleId:googlePayload.sub
		}
	})



	let user = isPatientExistInDbWithGoogleAuth;
	
	if (!isPatientExistInDbWithGoogleAuth) {



    const isPatientExistWithCredentials = await prisma.user.findUnique({
      where: {
        email: googlePayload.email,
        role: Role.PATIENT,
		authProvider:AuthProvider.CREDENTIAL
      },
    });

	if (isPatientExistWithCredentials) {
    if (isPatientExistWithCredentials.status === UserStatus.BLOCKED) {
      throw new Error("User is Blocked now ");
    }
    if (
      isPatientExistWithCredentials.status === UserStatus.DELETED ||
      isPatientExistWithCredentials.isDeleted
    ) {
      throw new Error("User is Deleted now ");
    }

    user = await prisma.user.update({
      where: {
        id: isPatientExistWithCredentials.id,
      },
      data: {
        googleId: googlePayload.sub,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        name: googlePayload.name,
        email: googlePayload.email,
        role: Role.PATIENT,
        googleId: googlePayload.sub,
        authProvider: AuthProvider.GOOGLE,
        emailVerified: true,
        patient: {
          create: {
            name: googlePayload.name,
            email: googlePayload.email,
          },
        },
      },
    });
  }

   
  }

  if(!user){
	throw new Error("User not found ")
  }

   if (user.status === UserStatus.BLOCKED) {
     throw new Error("User is Blocked now ");
   }
   if (
     user.status === UserStatus.DELETED ||
     user.isDeleted
   ) {
     throw new Error("User is Deleted now ");
   }




	// setup access token nd refresh token in cookies


	const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return{
	accessToken,
	refreshToken
  }

	
	
};


// forgot-password 
const forgotPassword=async(payload:IForgotPasswordPayload)=>{
	const {email}=payload
	const isExistUser=await prisma.user.findUnique({
		where:{email}
	})
	if(!isExistUser){
		throw new Error("There is no user in this email")
	}
	

	if(isExistUser.status==="BLOCKED"){
		throw new Error("User is Blocked")
	}
	if(!isExistUser.emailVerified){
		throw new Error("User not verified with this email")
	}

	if(isExistUser.isDeleted|| isExistUser.status==="DELETED"){
		throw new Error("User is deleted")
	}

	if(isExistUser.googleId&& isExistUser.authProvider==="GOOGLE"){
		throw new Error("User has already account with google")
	}

	// no user can make a otp
	const otp=crypto.randomInt(100000,1000000).toString()
	const key=`forgot-password-otp:${isExistUser.email}`
	await client.set(key,otp,{
		expiration:{
			type:"EX",
			value:5*60
		}
	})
	const templatePath=path.join(process.cwd(),"/src/app/templete/forgot-templete.ejs")

    const html=await ejs.renderFile(templatePath,{
		OTP:otp
	})
	// send email with otp 
	await transporter.sendMail({
		from:config.smtp_user,
		to:isExistUser.email,
		subject:"MediConnect forgot password OTP",
		html
	})


}
const resetPassword=async(payload:IResetPasswordPayload)=>{
	const { email ,otp ,newPassword} = payload;
  const isExistUser = await prisma.user.findUnique({
    where: { email },
  });
	if (!isExistUser) {
    throw new Error("There is no user in this email");
  }

  if (isExistUser.status === "BLOCKED") {
    throw new Error("User is Blocked");
  }
  if (!isExistUser.emailVerified) {
    throw new Error("User not verified with this email");
  }

  if (isExistUser.isDeleted || isExistUser.status === "DELETED") {
    throw new Error("User is deleted");
  }

  if (isExistUser.googleId && isExistUser.authProvider === "GOOGLE") {
    throw new Error("User has already account with google");
  }

  const key = `forgot-password-otp:${isExistUser.email}`;
  const getOtp=await client.get(key)

  if(!getOtp){
	throw new Error("OTP didn't found ")
  }

  if(otp!==getOtp){
	throw new Error("OTP doesn't match")
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.update({
	where:{
		email:isExistUser.email
	},
	data:{
		password:hashPassword
	}
  })

  await client.del([key])

  const templatePath = path.join(
    process.cwd(),
    "/src/app/templete/change-password.ejs",
  );

  const html = await ejs.renderFile(templatePath,{
	name:isExistUser.name
	
  });


  await transporter.sendMail({
    from: config.smtp_user,
    to: isExistUser.email,
    subject: "MediConnect forgot password OTP",
    html
  });

  

}

export const AuthService = {
	registerPatient,
	loginUser,
	getMe,
	refreshToken,
	googleLogin,
	forgotPassword,
	resetPassword
};
