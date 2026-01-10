import "./config/mongooseDb.js"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js"
import fileRoutes from "./routes/fileRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import checkAuthMiddleware from "./auth/checkAuthMiddleware.js";
import authRoutes from "./routes/authRoutes.js"
import { fetchUserFromGoggle, generateAuthUrl } from "./services/googleAuthService.js";
import User from "./modals/userModal.js";



try {
  const app = express();
app.use(cookieParser("storageDrive-guggi-123#"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});



app.use("/directory", checkAuthMiddleware, directoryRoutes);
app.use("/file", checkAuthMiddleware, fileRoutes);
app.use("/user", userRoutes);
app.use("/otp", authRoutes);


app.get("/auth/google", (req, res) => {
const authUrl = generateAuthUrl()
  res.redirect(authUrl);
  res.end()
});

app.get("/auth/google/callback", async (req, res) => {
  const { code, error } = req.query;

    // 1️⃣ User cancelled or Google denied
  if (error) {
    console.log("Google OAuth error:", error);

    return res.redirect(
      "http://localhost:5173/login?error=google_cancelled"
    );
  }

  // 2️⃣ No code = invalid state
  if (!code) {
    return res.redirect(
      "http://localhost:5173/login?error=no_code"
    );
  }

    const { sub, email, name, picture } = await fetchUserFromGoggle(code);
    console.log({ sub, email, name, picture });
  return res.end(`
  <script>
    window.opener.postMessage(
      { message: "success" },
      "http://localhost:5173"
    );
    window.close();
  </script>
`)

 try{
   // 1. Authenticate with Google
  const { sub, email, name, picture } = await fetchUserFromGoggle(code);

  // 2. Ensure user exists
 const user = await User.findOne({ email });

  if (!user) {
    user = { id: sub, email, name, picture };
    users.push(user);
    await writeFile("usersDb.json", JSON.stringify(users, null, 2));
  }

  // 3. DELETE ALL OLD SESSIONS FOR THIS USER
  for (let i = session.length - 1; i >= 0; i--) {
    if (session[i].userId === sub) {
      session.splice(i, 1);
    }
  }

  // 4. CREATE ONE NEW SESSION
  const sessionId = crypto.randomUUID();
  session.push({ sessionId, userId: sub });

  await writeFile("sessionsDb.json", JSON.stringify(session, null, 2));

 
res.redirect(`http://localhost:5500/callback.html?sid=${sessionId}`);
  return res.end();
 }catch(err){
    console.log("Error in Google OAuth callback:", err);
    return res.redirect(
      "http://localhost:5500/login.html?error=server_error"
    );
 }
});


app.listen(4000, () => {
  console.log(`Server Started at http://localhost:4000/`);
});

} catch (error) {
  console.log('could not connect to database');
  console.log(error);
}
