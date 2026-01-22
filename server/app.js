import "./config/mongooseDb.js"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js"
import fileRoutes from "./routes/fileRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import checkAuthMiddleware from "./auth/checkAuthMiddleware.js";
import authRoutes from "./routes/authRoutes.js"
import ownerRoutes from './routes/ownerRoutes.js'
import path from "path"
import checkAuth from "./auth/checkUserAuth.js";



try {
  const app = express();
app.use(cookieParser("storageDrive-guggi-123#"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/previews",
  express.static(path.join(process.cwd(), "previews"))
);

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
app.use("/", userRoutes);
app.use("/otp", authRoutes);
app.use("/auth", authRoutes);

app.use('/owner',checkAuth , ownerRoutes)



app.listen(4000, () => {
  console.log(`Server Started at http://localhost:4000/`);
});

} catch (error) {
  console.log('could not connect to database');
  console.log(error);
}
