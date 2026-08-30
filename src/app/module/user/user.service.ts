
import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary"
import { prisma } from "../../lib/prisma"


const uploadProfileImage=async(buffer:Buffer,userId:string)=>{

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select:{
        imagePublicId:true,
        imageUrl:true
      }
    });



    const cloudinaryResult=await new Promise<UploadApiResponse>((resolve,reject)=>{
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
            },
            async (error, result) => {
              if (error) {
                throw new Error(error.message);
              }

              if(!result){
                return reject(new Error("No file return form cloudinary "))
              }
             resolve(result)
             
            
            },
          )
          .end(buffer);

    })



    // update profile image

     const updatedProfile = await prisma.user.update({
       where: {
         id: userId,
       },
       data: {
         imageUrl:cloudinaryResult?.secure_url,
         imagePublicId:cloudinaryResult?.public_id,
       },
       omit:{
        password:true
       }
     });

     if(currentUser?.imagePublicId&& currentUser.imageUrl){
        await cloudinary.uploader.destroy(currentUser.imagePublicId)
     }
 return updatedProfile

    



}






export const userService={
    uploadProfileImage
}