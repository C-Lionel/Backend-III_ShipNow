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
    if (user.role === USER_ROLES.ADMIN) {
      throw new AppError(
        "No es posible crear admins desde este endpoint",
        400
      );
    }

    const existingUser = await usersRepository.findByEmail(user.email);

    if (existingUser) {
      throw new AppError(
        "Este email ya se encuentra registrado",
        409
      );
    }

    return usersRepository.create(user);
  }

  async update(id, user) {
    const updatedUser = await usersRepository.update(id, user);

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