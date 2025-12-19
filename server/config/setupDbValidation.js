import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  debug: false,
});
const uri =
  process.env.MONGODB_URI

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("driveClone");
    console.log("✅ Connected to MongoDB");

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
            updatedAt: { bsonType: "date" }
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
          required: ["fullname", "email", "password"],
          properties: {
            fullName: { bsonType: "string", minLength: 3 },
            email: {
              bsonType: "string",
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            },
            password: { bsonType: "string", minLength: 8 },
            rootDirId: { bsonType: ["objectId", "null"] },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
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
            size: { bsonType: "number", minimum: 0 },
            userId: { bsonType: "objectId" },
            parentDirId: { bsonType: "objectId" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
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
