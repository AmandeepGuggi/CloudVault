import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  debug: false,
});

const connectionStr = process.env.MONGODB_URI
export async function connectDB() {
  try{
    console.log("connected Databse");
     await mongoose.connect(connectionStr);
  }catch(err){
    console.log(err);
    console.log("Could Not Connect to the Database");
    process.exit(1)
  }
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Database Disconnected!");
  process.exit(0);
});

await connectDB()