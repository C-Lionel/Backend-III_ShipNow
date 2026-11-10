
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";

import app from "../../src/app.js";

import User from "../../src/models/user.model.js";
import Order from "../../src/models/order.model.js";
import Delivery from "../../src/models/delivery.model.js";

import {
  USER_ROLES,
  DELIVERY_STATUS,
  DELIVERY_PRIORITY
} from "../../src/constants/index.js";

describe("Deliveries API", () => {

  let customer;
  let driver;
  let order;

  let createdDeliveries = [];

  // Creamos los datos necesarios antes de cada test.
  beforeEach(async () => {
    const uniqueId = new mongoose.Types.ObjectId().toString();

    customer = await User.create({
      firstName: "Cliente",
      lastName: "Testing",
      email: `delivery.customer.${uniqueId}@ejemplo.com`,
      password: "PasswordDePrueba",
      role: USER_ROLES.CUSTOMER
    });

    driver = await User.create({
      firstName: "Repartidor",
      lastName: "Testing",
      email: `delivery.driver.${uniqueId}@ejemplo.com`,
      password: "PasswordDePrueba",
      role: USER_ROLES.DRIVER
    });

    order = await Order.create({
      customer: customer._id,
      items: [
        {
          name: "Paquete mediano",
          quantity: 2,
          price: 100
        }
      ],
      deliveryAddress: "San Martín 123, Venado Tuerto",
      total: 210,
      shippingCost: 10,
      declaredValue: 200
    });

    createdDeliveries = [];
  });

  // Limpiamos los registros creados por cada test.
  afterEach(async () => {
    await Delivery.deleteMany({
      _id: { $in: createdDeliveries }
    });

    if (order?._id) {
      await Order.findByIdAndDelete(order._id);
    }

    await User.deleteMany({
      _id: {
        $in: [customer?._id, driver?._id].filter(Boolean)
      }
    });
  });

  // Helper para crear entregas mediante la API.
  const createDelivery = async (data) => {
    const response = await request(app)
      .post("/api/deliveries")
      .send(data ?? { order: order._id });

    if (
      response.status === 201 &&
      response.body.payload?._id
    ) {
      createdDeliveries.push(response.body.payload._id);
    }

    return response;
  };

  // TEST 1
  it("debería obtener la lista de entregas", async () => {
    const response = await request(app)
      .get("/api/deliveries");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
  });

  // TEST 2
  it("debería crear una entrega sin repartidor", async () => {
    const response = await createDelivery();

    expect(response.status).to.equal(201);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.have.property("_id");

    expect(response.body.payload.driver).to.be.null;
    expect(response.body.payload.status).to.equal(
      DELIVERY_STATUS.PENDING
    );

    const savedDelivery = await Delivery.findById(
      response.body.payload._id
    );

    expect(savedDelivery).to.not.be.null;
  });

  // TEST 3
  it("debería crear una entrega con repartidor", async () => {
    const response = await createDelivery({
      order: order._id,
      driver: driver._id
    });

    expect(response.status).to.equal(201);
    expect(response.body.payload.status).to.equal(
      DELIVERY_STATUS.ASSIGNED
    );

    expect(response.body.payload.driver).to.equal(
      driver._id.toString()
    );

    expect(response.body.payload.assignedAt).to.not.be.null;
  });

  // TEST 4
  it("debería asignar prioridad normal por defecto", async () => {
    const response = await createDelivery();

    expect(response.status).to.equal(201);
    expect(response.body.payload.priority).to.equal(
      DELIVERY_PRIORITY.NORMAL
    );

    expect(response.body.payload.deliveredAt).to.be.null;
    expect(response.body.payload.assignedAt).to.be.null;
  });

  // TEST 5
  it("debería permitir indicar una prioridad alta", async () => {
    const response = await createDelivery({
      order: order._id,
      priority: DELIVERY_PRIORITY.HIGH
    });

    expect(response.status).to.equal(201);
    expect(response.body.payload.priority).to.equal(
      DELIVERY_PRIORITY.HIGH
    );
  });

  // TEST 6
  it("debería relacionar la entrega con el pedido", async () => {
    const response = await createDelivery();

    expect(response.status).to.equal(201);

    const savedOrder = await Order.findById(order._id);

    expect(savedOrder.delivery.toString()).to.equal(
      response.body.payload._id
    );
  });

  // TEST 7
  it("debería obtener una entrega existente por ID", async () => {
    const created = await createDelivery();

    expect(created.status).to.equal(201);

    const deliveryId = created.body.payload._id;

    const response = await request(app)
      .get(`/api/deliveries/${deliveryId}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload._id).to.equal(deliveryId);

    // El repositorio utiliza populate("order").
    expect(response.body.payload.order).to.be.an("object");
    expect(response.body.payload.order._id).to.equal(
      order._id.toString()
    );
  });

  // TEST 8
  it("debería actualizar el estado de una entrega", async () => {
    const created = await createDelivery();

    expect(created.status).to.equal(201);

    const deliveryId = created.body.payload._id;

    const response = await request(app)
      .put(`/api/deliveries/${deliveryId}`)
      .send({
        status: DELIVERY_STATUS.IN_TRANSIT
      });

    expect(response.status).to.equal(200);
    expect(response.body.payload.status).to.equal(
      DELIVERY_STATUS.IN_TRANSIT
    );

    const updatedDelivery = await Delivery.findById(deliveryId);

    expect(updatedDelivery.status).to.equal(
      DELIVERY_STATUS.IN_TRANSIT
    );
  });

  // TEST 9
  it("debería asignar un repartidor a una entrega existente", async () => {
    const created = await createDelivery();

    expect(created.status).to.equal(201);

    const deliveryId = created.body.payload._id;

    const response = await request(app)
      .put(`/api/deliveries/${deliveryId}`)
      .send({
        driver: driver._id
      });

    expect(response.status).to.equal(200);
    expect(response.body.payload.driver.toString()).to.equal(
      driver._id.toString()
    );

    const updatedDelivery = await Delivery.findById(deliveryId);

    expect(updatedDelivery.driver.toString()).to.equal(
      driver._id.toString()
    );
  });

  // TEST 10
  it("debería eliminar una entrega y desvincular el pedido", async () => {
    const created = await createDelivery();

    expect(created.status).to.equal(201);

    const deliveryId = created.body.payload._id;

    const response = await request(app)
      .delete(`/api/deliveries/${deliveryId}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");

    const deletedDelivery = await Delivery.findById(deliveryId);

    expect(deletedDelivery).to.be.null;

    const updatedOrder = await Order.findById(order._id);

    expect(updatedOrder.delivery).to.be.null;
  });

  // TEST 11
  it("debería rechazar una entrega con ID de pedido inválido", async () => {
    const response = await createDelivery({
      order: "id-invalido"
    });

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_ORDER_ID");
  });

  // TEST 12
  it("debería rechazar una entrega con pedido inexistente", async () => {
    const fakeOrderId = new mongoose.Types.ObjectId();

    const response = await createDelivery({
      order: fakeOrderId
    });

    expect(response.status).to.equal(404);
    expect(response.body.code).to.equal("ORDER_NOT_FOUND");
  });

  // TEST 13
  it("debería impedir crear dos entregas para el mismo pedido", async () => {
    const firstResponse = await createDelivery();

    expect(firstResponse.status).to.equal(201);

    const secondResponse = await createDelivery();

    expect(secondResponse.status).to.equal(409);
    expect(secondResponse.body.code).to.equal(
      "DELIVERY_ALREADY_EXISTS"
    );
  });

  // TEST 14
  it("debería rechazar un usuario que no sea repartidor", async () => {
    const response = await createDelivery({
      order: order._id,
      driver: customer._id
    });

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal("INVALID_DRIVER");
  });

  // TEST 15
  it("debería impedir cambiar el pedido asociado a una entrega", async () => {
    const created = await createDelivery();

    expect(created.status).to.equal(201);

    const deliveryId = created.body.payload._id;

    const response = await request(app)
      .put(`/api/deliveries/${deliveryId}`)
      .send({
        order: new mongoose.Types.ObjectId()
      });

    expect(response.status).to.equal(400);
    expect(response.body.code).to.equal(
      "DELIVERY_ORDER_CHANGE_FORBIDDEN"
    );

    const savedDelivery = await Delivery.findById(deliveryId);

    expect(savedDelivery.order.toString()).to.equal(
      order._id.toString()
    );
  });

  // TEST 16
  it("debería devolver 404 para una entrega inexistente", async () => {
    const fakeDeliveryId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/deliveries/${fakeDeliveryId}`);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal(
      "DELIVERY_NOT_FOUND"
    );
  });

});
