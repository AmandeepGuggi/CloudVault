import mongoose from "mongoose";


const connectionStr = "mongodb://driveAdmin:driveAdmin@localhost:27017/driveClone?authSource=admin&replicaSet=rs0"
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