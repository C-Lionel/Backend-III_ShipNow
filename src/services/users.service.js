
import bcrypt from "bcryptjs";

import { USER_ROLES } from "../constants/index.js";
import usersRepository from "../repositories/users.repository.js";
import AppError from "../utils/errors.js";

class UsersService {
  async findAll() {
    return usersRepository.findAll();
  }

  async findById(id) {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return user;
  }

  async create(user) {
    if (
      user.role !== undefined &&
      user.role !== USER_ROLES.CUSTOMER
    ) {
      throw new AppError(
        "Solo se permite registrar usuarios con rol customer",
        403
      );
    }
    const existingUser = await usersRepository.findByEmail(user.email);

    if (existingUser) {
      throw new AppError(
        "Este email ya se encuentra registrado",
        409
      );
    }

    const hashedPassword = await bcrypt.hash(user.password, 12);

    return usersRepository.create({
      ...user,
      password: hashedPassword,
      role: user.role || USER_ROLES.CUSTOMER
    });
  }



  async update(id, user) {
    const dataToUpdate = { ...user };

    // No permitimos modificar roles desde este endpoint.
    if (dataToUpdate.role !== undefined) {
      throw new AppError(
        "No está permitido modificar el rol de un usuario",
        403
      );
    }

    // Si se modifica la contraseña, aplicamos bcrypt.
    if (dataToUpdate.password !== undefined) {
      if (
        typeof dataToUpdate.password !== "string" ||
        !dataToUpdate.password.trim()
      ) {
        throw new AppError(
          "La contraseña no puede estar vacía",
          400
        );
      }

      dataToUpdate.password = await bcrypt.hash(
        dataToUpdate.password,
        12
      );
    }

    const updatedUser = await usersRepository.update(
      id,
      dataToUpdate
    );

    if (!updatedUser) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return updatedUser;
  }



  async delete(id) {
    const deletedUser = await usersRepository.delete(id);

    if (!deletedUser) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return deletedUser;
  }
}

export default new UsersService();
