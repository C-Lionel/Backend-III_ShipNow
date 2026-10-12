
import { Router } from "express";
import deliveriesController from "../controllers/deliveries.controller.js";

const router = Router();

router.get("/", (req, res, next) =>
  deliveriesController.findAll(req, res, next)
);

router.get("/:id", (req, res, next) =>
  deliveriesController.findById(req, res, next)
);

router.post("/", (req, res, next) =>
  deliveriesController.create(req, res, next)
);

router.put("/:id", (req, res, next) =>
  deliveriesController.update(req, res, next)
);

router.delete("/:id", (req, res, next) =>
  deliveriesController.delete(req, res, next)
);

export default router;
