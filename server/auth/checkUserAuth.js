import Session from "../modals/sessionModal.js";
import User from "../modals/userModal.js"

export default async function checkAuth(req, res, next) {
  const { sid } = req.signedCookies;
  console.log("cookies:", req.cookies);
console.log("signedCookies:", req.signedCookies);

  if (!sid) {
    return res.status(401).json({ error: "No sid ,Not authenticated, Not logged!" });
  }

  const session = await Session.findById(sid)

   if(!session) {
     return res.status(401).json({ error: "Not logged!" });
    }

  const user = await User.findOne({ _id: session.userId}).lean();
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user
  next()
}
