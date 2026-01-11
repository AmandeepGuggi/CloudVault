import mongoose from "mongoose";
import { connectDB } from "./mongooseDb.js";
import { auth } from "google-auth-library";


await connectDB()
const client = mongoose.connection.getClient();
async function run() {
  try {
    await client.connect();
    const db = mongoose.connection.db;

    // Ensure collections exist
    await db.createCollection("users").catch(() => {});
    await db.createCollection("directories").catch(() => {});
    await db.createCollection("files").catch(() => {});

    // DIRECTORIES
    await db.command({
      collMod: "directories",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "userId", "isDirectory"],
          properties: {
            name: { bsonType: "string", minLength: 1 },
            userId: { bsonType: "objectId" },
            parentDirId: { bsonType: ["objectId", "null"] },
            isDirectory: { bsonType: "bool" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
            __v: {bsonType: "int"}
          },
          additionalProperties: true
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    // USERS
    await db.command({
      collMod: "users",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["fullname", "email", "rootDirId"],
          properties: {
            fullname: { bsonType: "string", minLength: 3 },
            email: {
              bsonType: "string",
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            },
            password: { bsonType: "string", minLength: 8 },
            picture: { bsonType: "string"},
            authProvider: { bsonType: "string", enum: ["local", "google"] },
            rootDirId: { bsonType: ["objectId", "null"] },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
            __v: {bsonType: "int"}
          },
          additionalProperties: true
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    // FILES
    await db.command({
      collMod: "files",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "extension", "size", "userId", "parentDirId"],
          properties: {
            name: { bsonType: "string", minLength: 1 },
            extension: { bsonType: "string", minLength: 1, maxLength: 10 },
            size: { bsonType: "int", minimum: 0 },
            userId: { bsonType: "objectId" },
            parentDirId: { bsonType: "objectId" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
            __v: {bsonType: "int"}
          },
          additionalProperties: true
        }
      },
      validationLevel: "strict",
      validationAction: "error"
    });

    console.log("✅ Database-level validation applied");
  } catch (err) {
    console.error("❌ Failed to apply validators:", err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

run();
