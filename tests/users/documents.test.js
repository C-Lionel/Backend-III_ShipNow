
import { expect } from "chai";
import request from "supertest";
import fs from "node:fs/promises";
import path from "node:path";

import app from "../../src/app.js";
import User from "../../src/models/user.model.js";

import {
  resolveUploadPath
} from "../../src/middlewares/upload.middleware.js";

describe("Users - Document Upload API", function () {
  let userId;
  let userEmail;

  const uploadedPaths = new Set();

  // Archivo PNG mínimo para las pruebas
  const validPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=",
    "base64"
  );

  before(async function () {
    userEmail = `documents.${Date.now()}@ejemplo.com`;

    const user = await User.create({
      firstName: "Usuario",
      lastName: "Documentos",
      email: userEmail,
      password: "Test123456",
      role: "customer"
    });

    userId = user._id.toString();
  });

  after(async function () {
    // Recuperar los documentos asociados al usuario.
    const user = await User.findById(userId);

    if (user) {
      for (const document of user.documents ?? []) {
        if (document.path) {
          uploadedPaths.add(
            resolveUploadPath(document.path)
          );
        }
      }
    }

    // Eliminar los archivos físicos registrados.
    for (const filePath of uploadedPaths) {
      await fs.unlink(filePath).catch((error) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });
    }

    uploadedPaths.clear();

    await User.deleteOne({ _id: userId });
  });

  it("debería subir un documento de usuario correctamente", async function () {
    const response = await request(app)
      .post(`/api/users/${userId}/documents`)
      .field("documentType", "user_document")
      .attach("document", validPng, "documento.png");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");

    const user = await User.findById(userId);

    expect(user).to.not.be.null;
    expect(user.documents).to.have.lengthOf(1);

    const document = user.documents[0];

    const absolutePath = resolveUploadPath(document.path);
    uploadedPaths.add(absolutePath);

    expect(document.originalName).to.equal("documento.png");
    expect(document.documentType).to.equal("user_document");
    expect(document.mimeType).to.equal("image/png");
    expect(document.fileName).to.be.a("string");
    expect(document.size).to.be.greaterThan(0);

    // Verificar que MongoDB almacene una ruta relativa y portable.
    expect(document.path).to.equal(
      `user-documents/${document.fileName}`
    );

    expect(path.isAbsolute(document.path)).to.equal(false);
    expect(document.path).to.not.include("\\");

    // Verificar la existencia física del archivo.
    const fileStats = await fs.stat(absolutePath);

    expect(fileStats.isFile()).to.equal(true);
  });

  it("debería subir una licencia de conducir correctamente", async function () {
    const response = await request(app)
      .post(`/api/users/${userId}/documents`)
      .field("documentType", "driver_license")
      .attach("document", validPng, "licencia.png");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");

    const user = await User.findById(userId);

    expect(user.documents).to.have.lengthOf(2);

    const license = user.documents.find(
      (document) => document.documentType === "driver_license"
    );

    expect(license).to.exist;

    const absolutePath = resolveUploadPath(license.path);
    uploadedPaths.add(absolutePath);

    expect(license.originalName).to.equal("licencia.png");

    // Verificar que la licencia tenga una ruta relativa y portable.
    expect(license.path).to.equal(
      `driver-licenses/${license.fileName}`
    );

    expect(path.isAbsolute(license.path)).to.equal(false);
    expect(license.path).to.not.include("\\");

    // Verificar la existencia física de la licencia.
    const fileStats = await fs.stat(absolutePath);

    expect(fileStats.isFile()).to.equal(true);
  });

  it("debería rechazar una carga sin archivo", async function () {
    const response = await request(app)
      .post(`/api/users/${userId}/documents`)
      .field("documentType", "user_document");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("FILE_REQUIRED");
  });

  it("debería rechazar un tipo de documento inválido", async function () {
    const response = await request(app)
      .post(`/api/users/${userId}/documents`)
      .field("documentType", "tipo_invalido")
      .attach("document", validPng, "documento.png");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_DOCUMENT_TYPE");
  });

  it("debería rechazar archivos con formato no permitido", async function () {
    const response = await request(app)
      .post(`/api/users/${userId}/documents`)
      .field("documentType", "user_document")
      .attach(
        "document",
        Buffer.from("Archivo de prueba"),
        "documento.txt"
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
      .post(`/api/users/${userId}/documents`)
      .field("documentType", "user_document")
      .attach("document", largeFile, "documento.png");

    expect(response.status).to.equal(413);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("FILE_TOO_LARGE");
  });

  it("debería devolver 404 si el usuario no existe", async function () {
    const nonexistentUserId = "507f1f77bcf86cd799439011";

    const response = await request(app)
      .post(`/api/users/${nonexistentUserId}/documents`)
      .field("documentType", "user_document")
      .attach("document", validPng, "documento.png");

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("USER_NOT_FOUND");
  });

  it("debería rechazar un nombre de campo incorrecto", async function () {
    const response = await request(app)
      .post(`/api/users/${userId}/documents`)
      .field("documentType", "user_document")
      .attach("archivo", validPng, "documento.png");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_FILE_FIELD");
  });

  it("debería rechazar un ID de usuario inválido", async function () {
    const response = await request(app)
      .post("/api/users/id-invalido/documents")
      .field("documentType", "user_document")
      .attach("document", validPng, "documento.png");

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_ID");
  });

  it("debería impedir modificar documentos mediante PUT", async function () {
    const userBefore = await User.findById(userId);

    expect(userBefore.documents).to.not.be.empty;

    const originalDocuments = userBefore.documents.map(
      (document) => document.fileName
    );

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        documents: []
      });

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("VALIDATION_ERROR");

    const userAfter = await User.findById(userId);

    expect(
      userAfter.documents.map((document) => document.fileName)
    ).to.deep.equal(originalDocuments);
  });


  it("debería aceptar archivos con extensiones en mayúsculas", async function () {
    const response = await request(app)
      .post(`/api/users/${userId}/documents`)
      .field("documentType", "user_document")
      .attach("document", validPng, {
        filename: "documento.PNG",
        contentType: "image/png"
      });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");

    const user = await User.findById(userId);

    const document = user.documents.find(
      (document) => document.originalName === "documento.PNG"
    );

    expect(document).to.exist;

    const absolutePath = resolveUploadPath(document.path);
    uploadedPaths.add(absolutePath);

    expect(document.originalName).to.equal("documento.PNG");
    expect(document.mimeType).to.equal("image/png");

    // Verificar que la extensión se normalice a minúsculas.
    expect(path.extname(document.fileName)).to.equal(".png");

    // Verificar que la ruta sea relativa.
    expect(document.path).to.equal(
      `user-documents/${document.fileName}`
    );

    expect(path.isAbsolute(document.path)).to.equal(false);

    // Verificar la existencia física del archivo.
    const fileStats = await fs.stat(absolutePath);

    expect(fileStats.isFile()).to.equal(true);
  });

});
