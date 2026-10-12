
import { Router } from "express";
import ordersController from "../controllers/orders.controller.js";

const router = Router();

router.get("/", (req, res, next) =>
  ordersController.findAll(req, res, next)
);

router.get("/:id", (req, res, next) =>
  ordersController.findById(req, res, next)
);

router.post("/", (req, res, next) =>
  ordersController.create(req, res, next)
);

router.put("/:id", (req, res, next) =>
  ordersController.update(req, res, next)
);

router.delete("/:id", (req, res, next) =>
  ordersController.delete(req, res, next)
);

export default router;
