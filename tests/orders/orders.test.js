
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";

import app from "../../src/app.js";
import User from "../../src/models/user.model.js";
import Order from "../../src/models/order.model.js";

import {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_PRIORITY
} from "../../src/constants/index.js";

describe("Orders API", () => {

  let customer;
  let createdOrders = [];

  // Creamos un cliente antes de cada test.
  beforeEach(async () => {
    customer = await User.create({
      firstName: "Cliente",
      lastName: "Testing",
      email: `orders.${new mongoose.Types.ObjectId()}@ejemplo.com`,
      password: "PasswordDePrueba",
      role: USER_ROLES.CUSTOMER
    });

    createdOrders = [];
  });

  // Eliminamos los datos de prueba después de cada test.
  afterEach(async () => {
    await Order.deleteMany({
      _id: { $in: createdOrders }
    });

    if (customer?._id) {
      await User.findByIdAndDelete(customer._id);
    }
  });

  // Datos válidos para crear pedidos.
  const buildOrder = (customerId) => ({
    customer: customerId,
    items: [
      {
        name: "Paquete mediano",
        quantity: 2,
        price: 100
      },
      {
        name: "Paquete pequeño",
        quantity: 1,
        price: 50
      }
    ],
    deliveryAddress: "San Martín 123, Venado Tuerto"
  });

  // Helper para crear pedidos y registrar sus IDs.
  const createOrder = async (data) => {
    const response = await request(app)
      .post("/api/orders")
      .send(data ?? buildOrder(customer._id));

    if (response.status === 201 && response.body.payload?._id) {
      createdOrders.push(response.body.payload._id);
    }

    return response;
  };

  // TEST 1
  it("debería obtener la lista de pedidos", async () => {
    const response = await request(app).get("/api/orders");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
  });

  // TEST 2
  it("debería devolver 404 si el pedido no existe", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/orders/${orderId}`);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("ORDER_NOT_FOUND");
    expect(response.body.message).to.equal("Pedido no encontrado");
  });

  // TEST 3
  it("debería crear un pedido correctamente", async () => {
    const response = await createOrder();

    expect(response.status).to.equal(201);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("object");
    expect(response.body.payload).to.have.property("_id");

    const savedOrder = await Order.findById(
      response.body.payload._id
    );

    expect(savedOrder).to.not.be.null;
    expect(savedOrder.items).to.have.lengthOf(2);
    expect(savedOrder.deliveryAddress).to.equal(
      "San Martín 123, Venado Tuerto"
    );
  });

  // TEST 4
  it("debería calcular correctamente el total del pedido", async () => {
    const response = await createOrder();

    expect(response.status).to.equal(201);

    // (2 * 100) + (1 * 50) = 250
    // Envío = 10
    // Total = 260
    expect(response.body.payload.declaredValue).to.equal(250);
    expect(response.body.payload.shippingCost).to.equal(10);
    expect(response.body.payload.total).to.equal(260);
  });

  // TEST 5
  it("debería asignar el estado y la prioridad por defecto", async () => {
    const response = await createOrder();

    expect(response.status).to.equal(201);
    expect(response.body.payload.status).to.equal(
      ORDER_STATUS.CREATED
    );
    expect(response.body.payload.priority).to.equal(
      DELIVERY_PRIORITY.NORMAL
    );
    expect(response.body.payload.delivery).to.be.null;
  });

  // TEST 6
  it("debería obtener un pedido existente por ID", async () => {
    const createResponse = await createOrder();

    expect(createResponse.status).to.equal(201);

    const orderId = createResponse.body.payload._id;

    const response = await request(app)
      .get(`/api/orders/${orderId}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload._id).to.equal(orderId);

    // El repositorio utiliza populate("customer").
    expect(response.body.payload.customer).to.be.an("object");
    expect(response.body.payload.customer.email).to.equal(
      customer.email
    );
  });

  // TEST 7
  it("debería actualizar el estado de un pedido", async () => {
    const createResponse = await createOrder();

    expect(createResponse.status).to.equal(201);

    const orderId = createResponse.body.payload._id;

    const response = await request(app)
      .put(`/api/orders/${orderId}`)
      .send({
        status: ORDER_STATUS.ASSIGNED
      });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload.status).to.equal(
      ORDER_STATUS.ASSIGNED
    );

    const updatedOrder = await Order.findById(orderId);

    expect(updatedOrder.status).to.equal(
      ORDER_STATUS.ASSIGNED
    );
  });

  // TEST 8
  it("debería eliminar un pedido correctamente", async () => {
    const createResponse = await createOrder();

    expect(createResponse.status).to.equal(201);

    const orderId = createResponse.body.payload._id;

    const response = await request(app)
      .delete(`/api/orders/${orderId}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload._id).to.equal(orderId);

    const deletedOrder = await Order.findById(orderId);

    expect(deletedOrder).to.be.null;
  });

  // TEST 9
  it("debería rechazar un pedido sin items", async () => {
    const orderData = buildOrder(customer._id);
    orderData.items = [];

    const response = await createOrder(orderData);

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("ORDER_ITEMS_REQUIRED");
    expect(response.body.message).to.equal(
      "El pedido debe tener al menos un item"
    );
  });

  // TEST 10
  it("debería rechazar un pedido con cliente inexistente", async () => {
    const fakeCustomerId = new mongoose.Types.ObjectId();

    const response = await createOrder(
      buildOrder(fakeCustomerId)
    );

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal(
      "ORDER_CUSTOMER_NOT_FOUND"
    );
    expect(response.body.message).to.equal(
      "El cliente especificado no existe"
    );
  });

  // TEST 11
  it("debería rechazar un pedido con un usuario que no sea customer", async () => {
    const originalRole = customer.role;

    try {
      customer.role = USER_ROLES.DRIVER;
      await customer.save();

      const response = await createOrder();

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.code).to.equal(
        "INVALID_CUSTOMER_ROLE"
      );

    } finally {
      customer.role = originalRole;
      await customer.save();
    }
  });

  // TEST 12
  it("debería impedir modificar campos protegidos del pedido", async () => {
    const createResponse = await createOrder();

    expect(createResponse.status).to.equal(201);

    const orderId = createResponse.body.payload._id;

    const response = await request(app)
      .put(`/api/orders/${orderId}`)
      .send({
        total: 9999
      });

    expect(response.status).to.equal(403);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal(
      "ORDER_PROTECTED_FIELDS"
    );

    const savedOrder = await Order.findById(orderId);

    expect(savedOrder.total).to.equal(260);
  });

  // TEST 13
  it("debería devolver 404 al actualizar un pedido inexistente", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .put(`/api/orders/${orderId}`)
      .send({
        status: ORDER_STATUS.ASSIGNED
      });

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("ORDER_NOT_FOUND");
  });

  // TEST 14
  it("debería devolver 404 al eliminar un pedido inexistente", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .delete(`/api/orders/${orderId}`);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("ORDER_NOT_FOUND");
  });

});
