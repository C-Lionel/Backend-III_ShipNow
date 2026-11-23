
import { Router } from "express";

import deliveriesController from "../controllers/deliveries.controller.js";
import deliveriesService from "../services/deliveries.service.js";

import {
  uploadDeliveryProof
} from "../middlewares/upload.middleware.js";

const router = Router();

// Verificar que la entrega exista antes de recibir el archivo
const validateDelivery = async (req, res, next) => {
  try {
    await deliveriesService.findById(req.params.id);
    next();
  } catch (error) {
    next(error);
  }
};

// Obtener todas las entregas
router.get("/", (req, res, next) =>
  deliveriesController.findAll(req, res, next)
);

// Obtener una entrega por ID
router.get("/:id", (req, res, next) =>
  deliveriesController.findById(req, res, next)
);

// Crear una entrega
router.post("/", (req, res, next) =>
  deliveriesController.create(req, res, next)
);

// Actualizar una entrega
router.put("/:id", (req, res, next) =>
  deliveriesController.update(req, res, next)
);

// Eliminar una entrega
router.delete("/:id", (req, res, next) =>
  deliveriesController.delete(req, res, next)
);

// Cargar comprobante de entrega
router.post(
  "/:id/proof",
  validateDelivery,
  uploadDeliveryProof.single("proof"),
  (req, res, next) =>
    deliveriesController.uploadProof(req, res, next)
);

export default router;
