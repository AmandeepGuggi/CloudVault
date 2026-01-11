import dotenv from "dotenv";
dotenv.config();
import axios from "axios";


export const getGithubUser = async (code) => {
    try{
        // 1. Exchange code for token
          const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    },
    {
      headers: { Accept: "application/json" }
    }
  );


  const accessToken = tokenRes.data.access_token;

  // 2. Fetch user profile
  const userRes = await axios.get(
    "https://api.github.com/user",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
 

  const emailRes = await axios.get(
    "https://api.github.com/user/emails",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
    return userRes.data
    }catch(err){
        console.error("Error fetching GitHub user:", err);
        throw err;
    }
}