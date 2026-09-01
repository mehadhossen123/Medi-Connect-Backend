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
          payerReference: "01723888888", //user email or phone number
          callbackURL:
            `${config.bkash_callback_url}/appointment/book-appointment/payment/callback`,
         
          amount: "12",
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: "Inv0124",   //appointment id
        }),
      },
    );

    const creaateBkashPaymentResult=createBkashPayment.json()

    return creaateBkashPaymentResult

}




export const appointmentService={
    bookAppointment
}