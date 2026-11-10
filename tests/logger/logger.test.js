
import { expect } from "chai";
import request from "supertest";

import app from "../../src/app.js";
import logger from "../../src/utils/logger.js";

describe("Logger API", () => {

  it("debería ejecutar correctamente el endpoint de logging", async () => {
    const response = await request(app)
      .get("/api/logger-test");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.message).to.equal(
      "Prueba de logging ejecutada correctamente"
    );
  });

  it("debería tener configurados los niveles personalizados de Winston", () => {
    expect(logger.levels).to.have.property("fatal", 0);
    expect(logger.levels).to.have.property("error", 1);
    expect(logger.levels).to.have.property("warning", 2);
    expect(logger.levels).to.have.property("info", 3);
    expect(logger.levels).to.have.property("http", 4);
    expect(logger.levels).to.have.property("debug", 5);
  });

  it("debería utilizar el nivel debug en testing", () => {
    expect(logger.level).to.equal("debug");
  });

  it("debería tener configurado un transporte de consola", () => {
    const consoleTransport = logger.transports.find(
      (transport) => transport instanceof logger.transports[0].constructor &&
        transport.name === "console"
    );

    expect(consoleTransport).to.exist;
  });

});
