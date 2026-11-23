
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import fs from "node:fs/promises";

import {
  USER_ROLES,
  DOCUMENT_TYPES
} from "../constants/index.js";

import usersRepository from "../repositories/users.repository.js";
import AppError from "../utils/errors.js";
import { ErrorDictionary } from "../utils/errorDictionary.js";
import logger from "../utils/logger.js";
import { moveUserDocument } from "../middlewares/upload.middleware.js";

const ALLOWED_USER_DOCUMENT_TYPES = [
  DOCUMENT_TYPES.USER_DOCUMENT,
  DOCUMENT_TYPES.DRIVER_LICENSE
];

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

    if (dataToUpdate.role !== undefined) {
      throw new AppError(ErrorDictionary.USER_ROLE_UPDATE_FORBIDDEN);
    }

    if (dataToUpdate.documents !== undefined) {
      throw new AppError(ErrorDictionary.VALIDATION_ERROR);
    }

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

  // Asociar un documento a un usuario
  async addDocument(id, file, documentType) {
    try {
      if (!file) {
        throw new AppError(ErrorDictionary.FILE_REQUIRED);
      }

      if (!ALLOWED_USER_DOCUMENT_TYPES.includes(documentType)) {
        throw new AppError(ErrorDictionary.INVALID_DOCUMENT_TYPE);
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new AppError(ErrorDictionary.INVALID_ID);
      }

      const user = await usersRepository.findById(id);

      if (!user) {
        throw new AppError(ErrorDictionary.USER_NOT_FOUND);
      }

      moveUserDocument(file, documentType);

      const document = {
        originalName: file.originalname,
        fileName: file.filename,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        documentType,
        uploadedAt: new Date()
      };

      const updatedUser = await usersRepository.update(id, {
        documents: [...user.documents, document]
      });

      if (!updatedUser) {
        throw new AppError(ErrorDictionary.USER_NOT_FOUND);
      }

      logger.info(
        `Documento cargado correctamente - Usuario: ${id} - Tipo: ${documentType} - Archivo: ${file.filename}`
      );

      return updatedUser;

    } catch (error) {
      if (file?.path) {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          logger.error(
            `No se pudo eliminar el archivo ${file.path}: ${cleanupError.message}`
          );
        }
      }

      throw error;
    }
  }
}

export default new UsersService();
