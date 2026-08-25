import z, { email } from "zod";

 const UserRegisterZodSchema = z.object({
  name: z.string(),
  email: z.email("not email"),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password cannot exceed 32 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
  patient: z
    .object({
      contactNumber: z.string().optional(),
    })
    .optional(),
});
 const resetPasswordZodSchema = z.object({
  
  email: z.email("not email"),
  newPassword: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(32, { message: "Password cannot exceed 32 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number",
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
  patient: z
    .object({
      contactNumber: z.string().optional(),
    })
    .optional(),

    otp:z.string().length(6)
});

const forgotPasswordZodSchema=z.object({
  email:z.email()
})

const emailVerifiedZodSchema=z.object({
  email:z.email(),
  otp:z.string()
})





export const patientZodValidation = {
  UserRegisterZodSchema,
  resetPasswordZodSchema,
  forgotPasswordZodSchema,
  emailVerifiedZodSchema
};