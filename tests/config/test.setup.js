
import mongoose from "mongoose";
import { before, after } from "mocha";
import { config } from "../../src/config/config.js";

before(async () => {
  if (config.nodeEnv !== "test") {
    throw new Error("Los tests requieren NODE_ENV=test");
  }

  const databaseName = new URL(config.mongoUri).pathname.slice(1);

  if (databaseName !== "shipnow_test") {
    throw new Error("Los tests solo pueden utilizar shipnow_test");
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongoUri);
  }
});

after(async () => {
  await mongoose.disconnect();
});
