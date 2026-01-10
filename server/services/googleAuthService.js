import dotenv from "dotenv";
dotenv.config();
import { OAuth2Client } from "google-auth-library";

const redirectUri = "http://localhost:4000/auth/google/callback";

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || redirectUri,
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

export async function fetchUserFromGoggle(code) {
  try {
    const { tokens } = await client.getToken(code);
    console.log(tokens);
    const loginTicket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const userData = loginTicket.getPayload();
    return userData;
  } catch (err) {
    console.log("Error fetching user from Google:", err);
    throw err;
  }
}