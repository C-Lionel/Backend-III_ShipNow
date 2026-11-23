
import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";
import fs from "node:fs/promises";

import app from "../../src/app.js";

import User from "../../src/models/user.model.js";
import Order from "../../src/models/order.model.js";
import Delivery from "../../src/models/delivery.model.js";

import {
  USER_ROLES,
  DELIVERY_STATUS,
  DOCUMENT_TYPES
} from "../../src/constants/index.js";

describe("Deliveries - Proof Upload API", function () {
  let customer;
  let order;
  let delivery;

  const uploadedPaths = new Set();

  // Imagen PNG pequeña utilizada como archivo de prueba.
  const validPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=",
    "base64"
  );

  // Crear los datos necesarios antes de cada prueba.
  beforeEach(async function () {
    const uniqueId = new mongoose.Types.ObjectId().toString();

    customer = await User.create({
      firstName: "Cliente",
      lastName: "Comprobantes",
      email: `proof.customer.${uniqueId}@ejemplo.com`,
      password: "PasswordDePrueba",
      role: USER_ROLES.CUSTOMER
    });

    order = await Order.create({
      customer: customer._id,
      items: [
        {
          name: "Paquete de prueba",
          quantity: 1,
          price: 100
        }
      ],
      deliveryAddress: "San Martín 123",
      total: 110,
      shippingCost: 10,
      declaredValue: 100
    });

    delivery = await Delivery.create({
      order: order._id,
      status: DELIVERY_STATUS.PENDING
    });
  });

  // Eliminar los registros y archivos creados por cada prueba.
  afterEach(async function () {
    if (delivery?._id) {
      const savedDelivery = await Delivery.findById(delivery._id);

      if (savedDelivery) {
        for (const proof of savedDelivery.proofs ?? []) {
          if (proof.path) {
            uploadedPaths.add(proof.path);
          }
        }
      }
    }

    for (const filePath of uploadedPaths) {
      await fs.unlink(filePath).catch(() => {});
    }

    uploadedPaths.clear();

    if (delivery?._id) {
      await Delivery.findByIdAndDelete(delivery._id);
    }

    if (order?._id) {
      await Order.findByIdAndDelete(order._id);
    }

    if (customer?._id) {
      await User.findByIdAndDelete(customer._id);
    }
  });

  it("debería subir un comprobante correctamente", async function () {
    const response = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .attach("proof", validPng, "comprobante.png");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");

    const savedDelivery = await Delivery.findById(delivery._id);

    expect(savedDelivery).to.not.be.null;
    expect(savedDelivery.proofs).to.have.lengthOf(1);

    const proof = savedDelivery.proofs[0];

    expect(proof.originalName).to.equal("comprobante.png");
    expect(proof.mimeType).to.equal("image/png");
    expect(proof.documentType).to.equal(
      DOCUMENT_TYPES.DELIVERY_PROOF
    );
    expect(proof.fileName).to.be.a("string");
    expect(proof.path).to.include("delivery-proofs");
    expect(proof.size).to.be.greaterThan(0);

    uploadedPaths.add(proof.path);

    const fileStats = await fs.stat(proof.path);

    expect(fileStats.isFile()).to.equal(true);
  });

  it("debería permitir subir varios comprobantes a una entrega", async function () {
    const firstResponse = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .attach("proof", validPng, "comprobante-1.png");

    expect(firstResponse.status).to.equal(200);

    const secondResponse = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .attach("proof", validPng, "comprobante-2.png");

    expect(secondResponse.status).to.equal(200);

    const savedDelivery = await Delivery.findById(delivery._id);

    expect(savedDelivery.proofs).to.have.lengthOf(2);

    const fileNames = savedDelivery.proofs.map(
      (proof) => proof.fileName
    );

    expect(fileNames[0]).to.not.equal(fileNames[1]);

    for (const proof of savedDelivery.proofs) {
      uploadedPaths.add(proof.path);
    }
  });

  it("debería conservar el estado de la entrega al subir un comprobante", async function () {
    const response = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .attach("proof", validPng, "comprobante.png");

    expect(response.status).to.equal(200);

    const savedDelivery = await Delivery.findById(delivery._id);

    expect(savedDelivery.status).to.equal(
      DELIVERY_STATUS.PENDING
    );

    for (const proof of savedDelivery.proofs) {
      uploadedPaths.add(proof.path);
    }
  });

  it("debería rechazar una carga sin archivo", async function () {
    const response = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .field("description", "Comprobante sin archivo");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("FILE_REQUIRED");
  });

  it("debería rechazar archivos con formato no permitido", async function () {
    const response = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .attach(
        "proof",
        Buffer.from("Archivo de prueba"),
        "comprobante.txt"
      );

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_FILE_TYPE");
  });

  it("debería rechazar archivos superiores a 5 MB", async function () {
    const largeFile = Buffer.alloc(
      5 * 1024 * 1024 + 1024,
      1
    );

    const response = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .attach("proof", largeFile, "comprobante.png");

    expect(response.status).to.equal(413);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("FILE_TOO_LARGE");
  });

  it("debería devolver 404 si la entrega no existe", async function () {
    const nonexistentDeliveryId = "507f1f77bcf86cd799439011";

    const response = await request(app)
      .post(`/api/deliveries/${nonexistentDeliveryId}/proof`)
      .attach("proof", validPng, "comprobante.png");

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("DELIVERY_NOT_FOUND");
  });

  it("debería rechazar un nombre de campo incorrecto", async function () {
    const response = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .attach("archivo", validPng, "comprobante.png");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_FILE_FIELD");
  });

  it("debería rechazar un ID de entrega inválido", async function () {
    const response = await request(app)
      .post("/api/deliveries/id-invalido/proof")
      .attach("proof", validPng, "comprobante.png");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_DELIVERY_ID");
  });


  it("debería impedir modificar comprobantes mediante PUT", async function () {
    // Primero subimos un comprobante válido.
    const uploadResponse = await request(app)
      .post(`/api/deliveries/${delivery._id}/proof`)
      .attach("proof", validPng, "comprobante-protegido.png");

    expect(uploadResponse.status).to.equal(200);

    // Guardamos los comprobantes originales.
    const deliveryBefore = await Delivery.findById(delivery._id);

    expect(deliveryBefore.proofs).to.have.lengthOf(1);

    const originalFileNames = deliveryBefore.proofs.map(
      (proof) => proof.fileName
    );

    // Intentamos eliminar los comprobantes mediante PUT.
    const response = await request(app)
      .put(`/api/deliveries/${delivery._id}`)
      .send({
        proofs: []
      });

    // La API debe rechazar la modificación.
    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("VALIDATION_ERROR");

    // Comprobamos que MongoDB conserva los comprobantes.
    const deliveryAfter = await Delivery.findById(delivery._id);

    expect(
      deliveryAfter.proofs.map((proof) => proof.fileName)
    ).to.deep.equal(originalFileNames);
  });

});
