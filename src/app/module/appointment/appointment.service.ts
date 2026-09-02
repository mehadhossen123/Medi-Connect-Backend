
import config from "../../config"
import { getBkashIdToken } from "../../lib/bkash";

const bookAppointment=async()=>{


    // some business logic
    const idToken=await getBkashIdToken()
    if(!idToken){
        throw new Error("Access token didn't found")
    }




    // CREATE PAYMENT 
    const createBkashPayment = await fetch(
      `${config.bkash_baseurl}/tokenized/checkout/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: idToken,
          "X-App-Key": config.bkash_app_key,
        },
        body: JSON.stringify({
         
          mode: "0011",
          payerReference: "01723888887", //user email or phone number
          callbackURL:
            `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`,
         
          amount: "12",
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: "Inv0111",   //appointment id
        }),
      },
    );

    const creaateBkashPaymentResult=await createBkashPayment.json()
    

    return creaateBkashPaymentResult

}

const bookAppointmentCallbackUrl=async(query:Record<string,any>)=>{

    const paymentId=query?.paymentID
    if(!paymentId){
        throw new Error("Payment id is missing ")
      }

      const status=query?.status;
      if(!status){
        throw new Error("Payment status is missing ")
      }
    const bkashIdToken=await getBkashIdToken();

   

    if(!bkashIdToken){
        throw new Error("Bkash id token is missing ")
    }
//     get bkash payment transaction id 
    const bkashCreatePaymentResponse = await fetch(
      `${config.bkash_baseurl}/tokenized/checkout/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:bkashIdToken,
          "X-App-Key": config.bkash_app_key,
        },
        body: JSON.stringify({
          paymentID:paymentId
        }),
      },
    );

    



    const executedPaymentResult =await bkashCreatePaymentResponse.json();

    if (status === "success") {
      return {
        executedPaymentResult,
        redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=success`,
      };
    }
    if (status === "failure") {
      return {
        executedPaymentResult,
        redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=failure`,
      };
    }

    if(status==="cancel"){
      return {
        executedPaymentResult,
        redirectUrl: `${config.frontend_url}/dashboard/my-appointments?status=cancel`,
      };
    }


     return {
       executedPaymentResult,
       redirectUrl: `${config.frontend_url}/dashboard/my-appointments`,
     };
  
    

   

}




export const appointmentService={
    bookAppointment,
    bookAppointmentCallbackUrl
}