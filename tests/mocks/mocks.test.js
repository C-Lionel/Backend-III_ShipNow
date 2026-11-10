
import { expect } from "chai";
import request from "supertest";

import app from "../../src/app.js";

describe("Mocks API", () => {

  // TEST 1
  it("debería generar 10 usuarios por defecto", async () => {
    const response = await request(app).get("/api/mocks/users");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
    expect(response.body.payload).to.have.lengthOf(10);
  });

  // TEST 2
  it("debería generar la cantidad solicitada de usuarios", async () => {
    const response = await request(app)
      .get("/api/mocks/users?qty=5");

    expect(response.status).to.equal(200);
    expect(response.body.payload).to.have.lengthOf(5);

    response.body.payload.forEach((user) => {
      expect(user.role).to.equal("customer");
      expect(user).to.not.have.property("password");
    });
  });

  // TEST 3
  it("debería generar repartidores correctamente", async () => {
    const response = await request(app)
      .get("/api/mocks/drivers?qty=3");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.have.lengthOf(3);

    response.body.payload.forEach((driver) => {
      expect(driver.role).to.equal("driver");
      expect(driver).to.not.have.property("password");
    });
  });

  // TEST 4
  it("debería generar 10 repartidores por defecto", async () => {
    const response = await request(app)
      .get("/api/mocks/drivers");

    expect(response.status).to.equal(200);
    expect(response.body.payload).to.have.lengthOf(10);
  });

  // TEST 5
  it("debería generar pedidos simulados correctamente", async () => {
    const response = await request(app)
      .get("/api/mocks/orders?qty=4");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");

    const { customers, orders } = response.body.payload;

    expect(customers).to.be.an("array");
    expect(orders).to.be.an("array");

    expect(customers).to.have.lengthOf(4);
    expect(orders).to.have.lengthOf(4);

    customers.forEach((customer) => {
      expect(customer).to.not.have.property("password");
    });
  });

  // TEST 6
  it("debería generar 10 pedidos por defecto", async () => {
    const response = await request(app)
      .get("/api/mocks/orders");

    expect(response.status).to.equal(200);
    expect(response.body.payload.customers).to.have.lengthOf(10);
    expect(response.body.payload.orders).to.have.lengthOf(10);
  });

  // TEST 7
  it("debería generar entregas simuladas correctamente", async () => {
    const response = await request(app)
      .get("/api/mocks/deliveries?qty=3");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");

    const {
      customers,
      drivers,
      orders,
      deliveries
    } = response.body.payload;

    expect(customers).to.have.lengthOf(3);
    expect(drivers).to.have.lengthOf(3);
    expect(orders).to.have.lengthOf(3);
    expect(deliveries).to.have.lengthOf(3);

    customers.forEach((customer) => {
      expect(customer).to.not.have.property("password");
    });

    drivers.forEach((driver) => {
      expect(driver).to.not.have.property("password");
    });
  });

  // TEST 8
  it("debería generar 10 entregas por defecto", async () => {
    const response = await request(app)
      .get("/api/mocks/deliveries");

    expect(response.status).to.equal(200);
    expect(response.body.payload.deliveries).to.have.lengthOf(10);
  });

  // TEST 9
  it("debería rechazar una cantidad igual a cero", async () => {
    const response = await request(app)
      .get("/api/mocks/users?qty=0");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_MOCK_QUANTITY");
  });

  // TEST 10
  it("debería rechazar cantidades superiores a 100", async () => {
    const response = await request(app)
      .get("/api/mocks/drivers?qty=101");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_MOCK_QUANTITY");
  });

  // TEST 11
  it("debería rechazar cantidades decimales", async () => {
    const response = await request(app)
      .get("/api/mocks/orders?qty=2.5");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_MOCK_QUANTITY");
  });

  // TEST 12
  it("debería rechazar cantidades no numéricas", async () => {
    const response = await request(app)
      .get("/api/mocks/deliveries?qty=abc");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_MOCK_QUANTITY");
    expect(response.body.message).to.equal(
      "La cantidad debe ser un número entero entre 1 y 100"
    );
  });

  // TEST 13
  it("debería impedir ejecutar el seed en testing", async () => {
    const response = await request(app)
      .post("/api/mocks/seed")
      .send({ qty: 2 });

    expect(response.status).to.equal(403);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("SEED_FORBIDDEN");
    expect(response.body.message).to.equal(
      "El seed solo está permitido en desarrollo"
    );
  });

});
