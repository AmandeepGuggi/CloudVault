import User from "../modals/userModal.js"
import crypto from "node:crypto";



export default async function checkAuth(req, res, next) {
  const { token } = req.signedCookies;
  console.log(token);
  if (!token) {
    return res.status(401).json({ error: "Not logged!" });
  }

    const { id, expiry: expiryTimeInSeconds } = JSON.parse(Buffer.from(token, "base64url").toString());
    const currentTimeInSeconds = Math.round(Date.now() / 1000);
    

  if (currentTimeInSeconds > expiryTimeInSeconds) {
    res.clearCookie("token");
    return res.status(401).json({ error: "Not logged in!" });
  }

  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user
  next()
}
