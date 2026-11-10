
import { expect } from "chai";
import request from "supertest";
import app from "../../src/app.js";
import User from "../../src/models/user.model.js";

describe("Users API", () => {

  it("debería obtener la lista de usuarios", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("status");
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
  });

  it("debería devolver 404 si el usuario no existe", async () => {
    const userId = "507f1f77bcf86cd799439011";

    const response = await request(app).get(`/api/users/${userId}`);

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("USER_NOT_FOUND");
    expect(response.body.message).to.equal("Usuario no encontrado");
  });

  it("debería crear un usuario correctamente", async () => {
    const email = `testing.${Date.now()}.${Math.random().toString(36).slice(2)}@ejemplo.com`;

    const newUser = {
      firstName: "Usuario",
      lastName: "Testing",
      email,
      password: "Test123456"
    };

    let createdUserId;

    try {
      const response = await request(app)
        .post("/api/users")
        .send(newUser);

      expect(response.status).to.equal(201);
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("object");

      const createdUser = response.body.payload;
      createdUserId = createdUser._id;

      expect(createdUser.firstName).to.equal("Usuario");
      expect(createdUser.lastName).to.equal("Testing");
      expect(createdUser.email).to.equal(email);
      expect(createdUser).to.not.have.property("password");

      const savedUser = await User.findOne({ email });

      expect(savedUser).to.not.be.null;
      expect(savedUser.password).to.not.equal("Test123456");
      expect(savedUser.password).to.be.a("string");

    } finally {
      if (createdUserId) {
        await User.findByIdAndDelete(createdUserId);
      } else {
        await User.deleteOne({ email });
      }
    }
  });


it("debería devolver 409 si el email ya está registrado", async () => {
  const email = `duplicado.${Date.now()}.${Math.random().toString(36).slice(2)}@ejemplo.com`;

  const newUser = {
    firstName: "Usuario",
    lastName: "Duplicado",
    email,
    password: "Test123456"
  };

  try {
    // Primero creamos un usuario.
    const firstResponse = await request(app)
      .post("/api/users")
      .send(newUser);

    expect(firstResponse.status).to.equal(201);

    // Intentamos registrar otro con el mismo email.
    const response = await request(app)
      .post("/api/users")
      .send(newUser);

    // Comprobamos el error esperado.
    expect(response.status).to.equal(409);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("EMAIL_ALREADY_EXISTS");
    expect(response.body.message).to.equal(
      "Este email ya se encuentra registrado"
    );

    // Comprobamos que no se creó un segundo usuario.
    const users = await User.find({ email });
    expect(users).to.have.lengthOf(1);

  } finally {
    // Eliminamos los datos creados durante el test.
    await User.deleteMany({ email });
  }
});


it("debería obtener un usuario existente por ID", async () => {
  const email = `buscar.${Date.now()}.${Math.random().toString(36).slice(2)}@ejemplo.com`;

  const newUser = {
    firstName: "Usuario",
    lastName: "Busqueda",
    email,
    password: "Test123456"
  };

  try {
    // Creamos un usuario para realizar la prueba.
    const createResponse = await request(app)
      .post("/api/users")
      .send(newUser);

    expect(createResponse.status).to.equal(201);

    const userId = createResponse.body.payload._id;

    // Buscamos el usuario utilizando su ID.
    const response = await request(app)
      .get(`/api/users/${userId}`);

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("object");

    expect(response.body.payload._id).to.equal(userId);
    expect(response.body.payload.firstName).to.equal("Usuario");
    expect(response.body.payload.lastName).to.equal("Busqueda");
    expect(response.body.payload.email).to.equal(email);
    expect(response.body.payload).to.not.have.property("password");

  } finally {
    // Eliminamos el usuario de prueba.
    await User.deleteMany({ email });
  }
});


it("debería actualizar un usuario correctamente", async () => {
  const email = `actualizar.${Date.now()}.${Math.random().toString(36).slice(2)}@ejemplo.com`;

  const newUser = {
    firstName: "Usuario",
    lastName: "Original",
    email,
    password: "Test123456"
  };

  try {
    // Creamos un usuario de prueba.
    const createResponse = await request(app)
      .post("/api/users")
      .send(newUser);

    expect(createResponse.status).to.equal(201);

    const userId = createResponse.body.payload._id;

    // Actualizamos el apellido del usuario.
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        lastName: "Actualizado"
      });

    // Verificamos la respuesta de la API.
    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload.lastName).to.equal("Actualizado");
    expect(response.body.payload).to.not.have.property("password");

    // Comprobamos que el cambio se guardó en MongoDB.
    const updatedUser = await User.findById(userId);

    expect(updatedUser).to.not.be.null;
    expect(updatedUser.lastName).to.equal("Actualizado");

  } finally {
    // Eliminamos los datos de prueba.
    await User.deleteMany({ email });
  }
});


it("debería eliminar un usuario correctamente", async () => {
  const email = `eliminar.${Date.now()}.${Math.random().toString(36).slice(2)}@ejemplo.com`;

  const newUser = {
    firstName: "Usuario",
    lastName: "Eliminar",
    email,
    password: "Test123456"
  };

  try {
    // Creamos un usuario de prueba.
    const createResponse = await request(app)
      .post("/api/users")
      .send(newUser);

    expect(createResponse.status).to.equal(201);

    const userId = createResponse.body.payload._id;

    // Eliminamos el usuario mediante la API.
    const response = await request(app)
      .delete(`/api/users/${userId}`);

    // Verificamos la respuesta.
    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload._id).to.equal(userId);

    // Comprobamos que ya no existe en MongoDB.
    const deletedUser = await User.findById(userId);

    expect(deletedUser).to.be.null;

  } finally {
    // Limpieza por si el test falla antes de eliminarlo.
    await User.deleteMany({ email });
  }
});


it("debería impedir modificar el rol de un usuario", async () => {
  const email = `rol.${Date.now()}.${Math.random().toString(36).slice(2)}@ejemplo.com`;

  const newUser = {
    firstName: "Usuario",
    lastName: "Rol",
    email,
    password: "Test123456"
  };

  try {
    // Creamos un usuario de prueba.
    const createResponse = await request(app)
      .post("/api/users")
      .send(newUser);

    expect(createResponse.status).to.equal(201);

    const userId = createResponse.body.payload._id;

    // Intentamos modificar su rol.
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        role: "ADMIN"
      });

    // Verificamos que la API rechace la operación.
    expect(response.status).to.equal(403);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("USER_ROLE_UPDATE_FORBIDDEN");
    expect(response.body.message).to.equal(
      "No está permitido modificar el rol de un usuario"
    );

    // Verificamos que el rol original no haya cambiado.
    const savedUser = await User.findById(userId);

    expect(savedUser).to.not.be.null;
    expect(savedUser.role).to.equal("customer");

  } finally {
    // Eliminamos los datos de prueba.
    await User.deleteMany({ email });
  }
});


it("debería rechazar la creación de un usuario con contraseña vacía", async () => {
  const email = `password.${Date.now()}.${Math.random().toString(36).slice(2)}@ejemplo.com`;

  const newUser = {
    firstName: "Usuario",
    lastName: "SinPassword",
    email,
    password: ""
  };

  try {
    const response = await request(app)
      .post("/api/users")
      .send(newUser);

    expect(response.status).to.equal(400);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("INVALID_PASSWORD");
    expect(response.body.message).to.equal(
      "La contraseña no puede estar vacía"
    );

    // Verificamos que no se haya creado el usuario.
    const savedUser = await User.findOne({ email });

    expect(savedUser).to.be.null;

  } finally {
    await User.deleteMany({ email });
  }
});


it("debería impedir registrar un usuario con rol de administrador", async () => {
  const email = `admin.${Date.now()}.${Math.random().toString(36).slice(2)}@ejemplo.com`;

  const newUser = {
    firstName: "Usuario",
    lastName: "Administrador",
    email,
    password: "Test123456",
    role: "admin"
  };

  try {
    // Intentamos crear un usuario con rol de administrador.
    const response = await request(app)
      .post("/api/users")
      .send(newUser);

    // Verificamos que la API rechace la operación.
    expect(response.status).to.equal(403);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("USER_ROLE_FORBIDDEN");
    expect(response.body.message).to.equal(
      "Solo se permite registrar usuarios con rol customer"
    );

    // Comprobamos que el usuario no se haya guardado.
    const savedUser = await User.findOne({ email });

    expect(savedUser).to.be.null;

  } finally {
    // Limpiamos cualquier dato de prueba.
    await User.deleteMany({ email });
  }
});



});
