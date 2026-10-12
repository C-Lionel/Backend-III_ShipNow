
import mocksService from "../services/mocks.service.js";
import mocksSeedService from "../services/mocks.seed.service.js";

class MocksController {
  async getUsers(req, res, next) {
    try {
      const users = mocksService.generateUsers(req.query.qty ?? 10);

      const safeUsers = users.map(({ password, ...user }) => user);

      res.status(200).json({
        status: "success",
        payload: safeUsers
      });
    } catch (error) {
      next(error);
    }
  }

  async getDrivers(req, res, next) {
    try {
      const drivers = mocksService.generateDrivers(req.query.qty ?? 10);

      const safeDrivers = drivers.map(({ password, ...driver }) => driver);

      res.status(200).json({
        status: "success",
        payload: safeDrivers
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const data = mocksService.generateOrders(req.query.qty ?? 10);

      const safeCustomers = data.customers.map(
        ({ password, ...customer }) => customer
      );

      res.status(200).json({
        status: "success",
        payload: {
          customers: safeCustomers,
          orders: data.orders
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveries(req, res, next) {
    try {
      const data = mocksService.generateDeliveries(req.query.qty ?? 10);

      const safeCustomers = data.customers.map(
        ({ password, ...customer }) => customer
      );

      const safeDrivers = data.drivers.map(
        ({ password, ...driver }) => driver
      );

      res.status(200).json({
        status: "success",
        payload: {
          customers: safeCustomers,
          drivers: safeDrivers,
          orders: data.orders,
          deliveries: data.deliveries
        }
      });
    } catch (error) {
      next(error);
    }
  }

  
async seed(req, res, next) {
  try {
    const { qty = 10 } = req.body;

    const result = await mocksSeedService.seed(qty);

    res.status(201).json({
      status: "success",
      message: "Datos simulados insertados correctamente",
      payload: result
    });
  } catch (error) {
    next(error);
  }
}

}

export default new MocksController();
