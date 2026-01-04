import "./config/mongooseDb.js"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js"
import fileRoutes from "./routes/fileRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import checkAuthMiddleware from "./auth/checkAuthMiddleware.js";
import authRoutes from "./routes/authRoutes.js"



try {
  const app = express();
app.use(cookieParser("storageDrive-guggi-123#"));
app.use((req, res, next) => {
  console.log("running app.js");
  console.log("RAW Cookie Header:", req.headers.cookie);
  console.log("req.cookies:", req.cookies);
  console.log("req.signedCookies:", req.signedCookies);
  next();
});
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);




app.use("/directory", checkAuthMiddleware, directoryRoutes);
app.use("/file", checkAuthMiddleware, fileRoutes);
app.use("/user", userRoutes);
app.use("/otp", authRoutes);

app.use((err, req, res, next) => {
  console.error("💥 REAL ERROR ↓↓↓");
  console.error(err);
  console.error("💥 STACK ↓↓↓");
  console.error(err.stack);

  res.status(500).json({
    error: err.message,
    stack: err.stack
  });
});



app.listen(4000, () => {
  console.log(`Server Started at http://localhost:4000/`);
});

} catch (error) {
  console.log('could not connect to database');
  console.log(error);
}
