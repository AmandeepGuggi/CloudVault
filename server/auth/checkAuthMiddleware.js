import redisClient from "../config/redis.js";
import Session from "../modals/sessionModal.js";
import User from "../modals/userModal.js";

export default async function checkAuthMiddleware(req, res, next) {
   const { sid } = req.signedCookies;

    if (!sid) {
      res.clearCookie("sid")
      return res.status(401).json({ error: "Not logged!" });
    }
  
    // const session = await Session.findById(sid)
    const session = await redisClient.json.get(`session:${sid}`)
      
    if(!session) {
     return res.status(401).json({ error: "Not logged!" });
    }

     // ✅ Update lastActiveAt (throttled)
  const now = Date.now();
  const lastActive = session.lastActiveAt
    ? new Date(session.lastActiveAt).getTime()
    : 0;

  // update only if idle > 1 minute
  if (now - lastActive > 60_000) {
    await Session.updateOne(
      { _id: session._id },
      { $set: { lastActiveAt: new Date() } }
    );
  }
      

  const user = await User.findOne({ _id: session.userId}).lean();
  if (!user) {
    return res.status(401).json({ error: "Not logged!" });
  }
  req.user = user
  next()
}
