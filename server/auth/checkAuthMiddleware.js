import Session from "../modals/sessionModal.js";
import User from "../modals/userModal.js";

export default async function checkAuthMiddleware(req, res, next) {
   const { sid } = req.signedCookies;

    if (!sid) {
      res.clearCookie("sid")
      return res.status(401).json({ error: "Not logged!" });
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
