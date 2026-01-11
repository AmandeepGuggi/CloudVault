import dotenv from "dotenv";
dotenv.config();
import { OAuth2Client } from "google-auth-library";



const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
});

export const generateAuthUrl = () =>
  client.generateAuthUrl({
    // access_type: 'offline',
    // prompt: 'consent', //select_account/consent/none
    // login_hint : "",
    scope: [
      "openid", 
      "email", 
      "profile"],
  });

  export const verifyIdToken = async (idToken) => {
      const loginTicket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const userData = loginTicket.getPayload();
    return userData;
  }
