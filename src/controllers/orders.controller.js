
import ordersService from "../services/orders.service.js";

class OrdersController {
  async findAll(req, res, next) {
    try {
      const orders = await ordersService.findAll();

      res.status(200).json({
        status: "success",
        payload: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const order = await ordersService.findById(req.params.id);

      res.status(200).json({
        status: "success",
        payload: order
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const order = await ordersService.create(req.body);

      res.status(201).json({
        status: "success",
        payload: order
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const order = await ordersService.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        status: "success",
        payload: order
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const order = await ordersService.delete(req.params.id);

      res.status(200).json({
        status: "success",
        payload: order
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrdersController();
