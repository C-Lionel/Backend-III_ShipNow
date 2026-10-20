import bcrypt from "bcryptjs";

import { USER_ROLES } from "../constants/index.js";
import usersRepository from "../repositories/users.repository.js";
import AppError from "../utils/errors.js";
import { ErrorDictionary } from "../utils/errorDictionary.js";

class UsersService {
  async findAll() {
    return usersRepository.findAll();
  }

  async findById(id) {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw new AppError(ErrorDictionary.USER_NOT_FOUND);
    }

    return user;
  }

  async create(user) {
    if (
      user.role !== undefined &&
      user.role !== USER_ROLES.CUSTOMER
    ) {
      throw new AppError(ErrorDictionary.USER_ROLE_FORBIDDEN);
    }

    const existingUser = await usersRepository.findByEmail(user.email);

    if (existingUser) {
      throw new AppError(ErrorDictionary.EMAIL_ALREADY_EXISTS);
    }

    // Validamos la contraseña antes de aplicar bcrypt.
    if (
      typeof user.password !== "string" ||
      !user.password.trim()
    ) {
      throw new AppError(ErrorDictionary.INVALID_PASSWORD);
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
      throw new AppError(ErrorDictionary.USER_ROLE_UPDATE_FORBIDDEN);
    }

    // Si se modifica la contraseña, aplicamos bcrypt.
    if (dataToUpdate.password !== undefined) {
      if (
        typeof dataToUpdate.password !== "string" ||
        !dataToUpdate.password.trim()
      ) {
        throw new AppError(ErrorDictionary.INVALID_PASSWORD);
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
      throw new AppError(ErrorDictionary.USER_NOT_FOUND);
    }

    return updatedUser;
  }

  async delete(id) {
    const deletedUser = await usersRepository.delete(id);

    if (!deletedUser) {
      throw new AppError(ErrorDictionary.USER_NOT_FOUND);
    }

    return deletedUser;
  }
}

export default new UsersService();