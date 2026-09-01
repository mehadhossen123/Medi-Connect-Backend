import config from "../config";
import { client } from "./redis";

export const getBkashIdToken = async () => {
  try {
    const idTokenKey = "bkash:idToken";
    const refreshTokenKey = "bkash:refreshToken";

    let bkashIdToken = await client.get(idTokenKey);
    const bkashIdTokenTTl=await client.ttl(idTokenKey)
    let bkashRefreshToken = await client.get(refreshTokenKey);
    const bkashRefreshTokenTTL = await client.ttl(idTokenKey);

    // if has id toekn direct return id token
    if (bkashIdToken) {
      return bkashIdToken;
    }

    // ২. যদি idToken না থাকে কিন্তু refreshToken থাকে, তবে রিফ্রেশ করবে
    if ((bkashIdTokenTTl <= 6000 || !bkashIdToken) && bkashRefreshToken && bkashRefreshTokenTTL>6000) {
      const refreshTokenResponse = await fetch(
        `${config.bkash_baseurl}/tokenized/checkout/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.bkash_username,
            password: config.bkash_password,
          },
          body: JSON.stringify({
            app_key: config.bkash_app_key,
            app_secret: config.bkash_app_secret,
            refresh_token: bkashRefreshToken,
          }),
        },
      );

      const response = await refreshTokenResponse.json();

      if (response?.id_token) {
        await client.set(idTokenKey, response.id_token, {
          EX: 3500,
        });

        if (response?.refresh_token) {
          await client.set(refreshTokenKey, response.refresh_token, {
            EX: 28 * 24 * 60 * 60, //28 days
          });
        }

        return response.id_token;
      }
    }


    if (bkashIdTokenTTl>600){
        return bkashIdToken
    }


      const response = await fetch(
        `${config.bkash_baseurl}/tokenized/checkout/token/grant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            username: config.bkash_username,
            password: config.bkash_password,
          },
          body: JSON.stringify({
            app_key: config.bkash_app_key,
            app_secret: config.bkash_app_secret,
          }),
        },
      );

    if (!response.ok) {
      throw new Error("bKash access token request failed");
    }

    const result = await response.json();

   
    await client.set(idTokenKey, result.id_token, {
      EX: 3500,
    });

  
    await client.set(refreshTokenKey, result.refresh_token, {
      EX: 28 * 24 * 60 * 60, // 2419200 seconds (28 Days)
    });

    return result.id_token;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
