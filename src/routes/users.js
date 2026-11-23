
import { Router } from "express";

import usersController from "../controllers/users.controller.js";
import usersService from "../services/users.service.js";

import {
  uploadUserDocument
} from "../middlewares/upload.middleware.js";

const router = Router();

// Verificar que el usuario exista antes de recibir el archivo
const validateDocumentUser = async (req, res, next) => {
  try {
    await usersService.findById(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
};

router.get("/", usersController.findAll);
router.get("/:id", usersController.findById);
router.post("/", usersController.create);
router.put("/:id", usersController.update);
router.delete("/:id", usersController.delete);

// Cargar un documento de usuario
router.post(
  "/:id/documents",
  validateDocumentUser,
  uploadUserDocument.single("document"),
  usersController.uploadDocument
);

export default router;
