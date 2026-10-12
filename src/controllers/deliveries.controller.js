
import deliveriesService from "../services/deliveries.service.js";

class DeliveriesController {
  async findAll(req, res, next) {
    try {
      const deliveries = await deliveriesService.findAll();

      res.status(200).json({
        status: "success",
        payload: deliveries
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const delivery = await deliveriesService.findById(req.params.id);

      res.status(200).json({
        status: "success",
        payload: delivery
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const delivery = await deliveriesService.create(req.body);

      res.status(201).json({
        status: "success",
        payload: delivery
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const delivery = await deliveriesService.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        status: "success",
        payload: delivery
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const delivery = await deliveriesService.delete(req.params.id);

      res.status(200).json({
        status: "success",
        payload: delivery
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DeliveriesController();
