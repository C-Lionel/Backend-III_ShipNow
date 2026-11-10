
import { expect } from "chai";
import request from "supertest";

import app from "../../src/app.js";
import swaggerSpecs from "../../src/config/swagger.config.js";

describe("Swagger API", () => {

  it("debería mostrar la documentación Swagger UI", async () => {
    const response = await request(app)
      .get("/api/docs/");

    expect(response.status).to.equal(200);
    expect(response.headers["content-type"]).to.include("text/html");
    expect(response.text).to.include("Swagger UI");
  });

  it("debería servir los recursos estáticos de Swagger", async () => {
    const response = await request(app)
      .get("/api/docs/swagger-ui.css");

    expect(response.status).to.equal(200);
    expect(response.headers["content-type"]).to.include("text/css");
  });

  it("debería tener definida la información de la API", () => {
    expect(swaggerSpecs).to.have.property("info");
    expect(swaggerSpecs.info).to.have.property("title");
    expect(swaggerSpecs.info).to.have.property("version");
  });

  it("debería documentar los endpoints de usuarios y pedidos", () => {
    expect(swaggerSpecs).to.have.property("paths");
    expect(swaggerSpecs.paths).to.have.property("/api/users");
    expect(swaggerSpecs.paths).to.have.property("/api/orders");
  });

});
