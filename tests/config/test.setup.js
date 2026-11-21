
import mongoose from "mongoose";
import { before, after } from "mocha";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

before(async function () {
  this.timeout(120000);

  if (process.env.NODE_ENV !== "test") {
    throw new Error("Los tests requieren NODE_ENV=test");
  }

  mongoServer = await MongoMemoryServer.create({
    instance: {
      dbName: "shipnow_test"
    }
  });

  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);

  console.log("MongoDB en memoria iniciado para testing");
});

after(async function () {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log("MongoDB en memoria detenido");
});
