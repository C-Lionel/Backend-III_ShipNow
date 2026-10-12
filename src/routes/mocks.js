
import { Router } from "express";
import mocksController from "../controllers/mocks.controller.js";

const router = Router();

router.get("/users", (req, res, next) =>
  mocksController.getUsers(req, res, next)
);

router.get("/drivers", (req, res, next) =>
  mocksController.getDrivers(req, res, next)
);

router.get("/orders", (req, res, next) =>
  mocksController.getOrders(req, res, next)
);

router.get("/deliveries", (req, res, next) =>
  mocksController.getDeliveries(req, res, next)
);

router.post("/seed", (req, res, next) =>
  mocksController.seed(req, res, next)
);

export default router;
