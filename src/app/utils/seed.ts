// seed super admin 
import bcrypt from"bcryptjs"
import { prisma } from "../lib/prisma"
import { Role } from "../../generated/prisma/enums"
import config from "../config"


export const seedSuperAdmin=async()=>{

   try {
     const isExistSuperAdmin = await prisma.user.findFirst({
       where: {
         role: Role.SUPER_ADMIN,
       },
     });

     if (isExistSuperAdmin) {
       console.log("Super admin already exist in the database");
       return
     }
     const email = config.super_admin_email;
     const name = config.super_admin_name;
     const password = config.super_admin_password;

     if(!email|| !name ||  !password){
        throw new Error("Super admin Email ,password and name is missing")
     }

     const hashPassword = await bcrypt.hash(
       password,
       Number(config.bcrypt_salt_rounds),
     );

     const createSuperAdmin = await prisma.user.create({
       data: {
         name,
         email,
         password: hashPassword,
         role: Role.SUPER_ADMIN,
         needPasswordChange: false,
         emailVerified: true,
       },
     });

     console.log("Super admin created",createSuperAdmin)


    
   } catch (error) {
    console.log("Error",error)

    await prisma.user.delete({
        where:{
            email:config.super_admin_email
        }
    })
    
   }

}

// seed tester admin

export const seedTesterAdmin=async()=>{

   try {
     const isExistTesterAdmin = await prisma.user.findUnique({
       where: {
         email:config.tester_admin_email,
       },
     });

     if (isExistTesterAdmin) {
       console.log(" admin already exist in the database");
       return
     }
     const email = config.tester_admin_email
     const name = config.tester_admin_name;
     const password = config.tester_admin_password;

     if(!email|| !name ||  !password){
        throw new Error("Admin Email ,password and name is missing")
     }

     const hashPassword = await bcrypt.hash(
       password,
       Number(config.bcrypt_salt_rounds),
     );

     const createTesterAdmin = await prisma.user.create({
       data: {
         name,
         email,
         password: hashPassword,
         role: Role.ADMIN,
         needPasswordChange: false,
         emailVerified: true,
       },
     });

     console.log("Super admin created",createTesterAdmin)


    
   } catch (error) {
    console.log("Error",error)

    await prisma.user.delete({
        where:{
            email:config.tester_admin_name
        }
    })
    
   }

}


// seed tester doctor
export const seedTesterDoctor=async()=>{

   try {
     const isExistTesterDoctor = await prisma.user.findUnique({
       where: {
         email:config.tester_doctor_email,
       },
     });

     if (isExistTesterDoctor) {
       console.log(" doctor already exist in the database");
       return
     }
     const email = config.tester_doctor_email
     const name = config.tester_admin_name;
     const password = config.tester_doctor_password;

     if(!email|| !name ||  !password){
        throw new Error("Doctor Email ,password and name is missing")
     }

     const hashPassword = await bcrypt.hash(
       password,
       Number(config.bcrypt_salt_rounds),
     );

     const createTesterDoctor = await prisma.user.create({
       data: {
         name,
         email,
         password: hashPassword,
         role: Role.DOCTOR,
         needPasswordChange: false,
         emailVerified: true,
       },
     });

     console.log("Super admin created",createTesterDoctor)


    
   } catch (error) {
    console.log("Error",error)

    await prisma.user.delete({
        where:{
            email:config.tester_doctor_email
        }
    })
    
   }

}

