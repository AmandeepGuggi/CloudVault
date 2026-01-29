import redisClient from "../config/redis.js";

export const getLoggedInDevices = async (req, res) => {
    
  try {
    const currentSessionId = req.signedCookies.sid;
    if (!currentSessionId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const sessions = await redisClient.ft.search("userIdIdx",`@userId:{${req.user._id}}`)
  
    const devices = sessions.documents.map(({id, value}) => ({
      sessionId: id,
      deviceName: value.deviceName,
      ipAddress: value.ipAddress,
      lastActiveAt: value.lastActiveAt,
      createdAt: value.createdAt,
      isCurrentDevice: id === currentSessionId
    }));
    //   const sessions = await Session.find({
    //   userId: req.user._id,
    //   isRevoked: false
    // })
    //   .sort({ createdAt: -1 })
    //   .lean();
    // const devices = sessions.map(session => ({
    //   sessionId: session._id,
    //   deviceName: session.deviceName,
    //   ipAddress: session.ipAddress,
    //   lastActiveAt: session.lastActiveAt,
    //   createdAt: session.createdAt,
    //   isCurrentDevice: session._id.toString() === currentSessionId
    // }));

    res.status(200).json(devices);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

