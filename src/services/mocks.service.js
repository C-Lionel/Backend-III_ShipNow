
import mongoose from "mongoose";

import { USER_ROLES } from "../constants/index.js";

import { generateMockUsers } from "../mocks/users.mock.js";
import { generateMockOrders } from "../mocks/orders.mock.js";
import { generateMockDeliveries } from "../mocks/deliveries.mock.js";

import AppError from "../utils/errors.js";

import { ErrorDictionary } from "../utils/errorDictionary.js";

class MocksService {
  validateQuantity(quantity) {
    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1 ||
      parsedQuantity > 100
    ) {
      throw new AppError(ErrorDictionary.INVALID_MOCK_QUANTITY);
    }

    return parsedQuantity;
  }

  generateUsers(quantity = 10) {
    const qty = this.validateQuantity(quantity);

    return generateMockUsers(qty, USER_ROLES.CUSTOMER);
  }

  generateDrivers(quantity = 10) {
    const qty = this.validateQuantity(quantity);

    return generateMockUsers(qty, USER_ROLES.DRIVER);
  }

  generateOrders(quantity = 10) {
    const qty = this.validateQuantity(quantity);

    const customers = generateMockUsers(qty, USER_ROLES.CUSTOMER);

    const customersWithIds = customers.map((customer) => ({
      _id: new mongoose.Types.ObjectId(),
      ...customer
    }));

    const customerIds = customersWithIds.map(
      (customer) => customer._id
    );

    const orders = generateMockOrders(qty, customerIds);

    return {
      customers: customersWithIds,
      orders
    };
  }

  generateDeliveries(quantity = 10) {
    const qty = this.validateQuantity(quantity);

    const customers = generateMockUsers(qty, USER_ROLES.CUSTOMER);
    const drivers = generateMockUsers(qty, USER_ROLES.DRIVER);

    const customersWithIds = customers.map((customer) => ({
      _id: new mongoose.Types.ObjectId(),
      ...customer
    }));

    const driversWithIds = drivers.map((driver) => ({
      _id: new mongoose.Types.ObjectId(),
      ...driver
    }));

    const customerIds = customersWithIds.map(
      (customer) => customer._id
    );

    const driverIds = driversWithIds.map(
      (driver) => driver._id
    );

    const orders = generateMockOrders(qty, customerIds);

    const ordersWithIds = orders.map((order) => ({
      _id: new mongoose.Types.ObjectId(),
      ...order
    }));

    const orderIds = ordersWithIds.map(
      (order) => order._id
    );

    const deliveries = generateMockDeliveries(
      orderIds,
      driverIds
    );

    const deliveriesWithIds = deliveries.map((delivery) => ({
      _id: new mongoose.Types.ObjectId(),
      ...delivery
    }));

    const ordersWithDeliveries = ordersWithIds.map(
      (order, index) => ({
        ...order,
        delivery: deliveriesWithIds[index]._id
      })
    );

    return {
      customers: customersWithIds,
      drivers: driversWithIds,
      orders: ordersWithDeliveries,
      deliveries: deliveriesWithIds
    };
  }
}

export default new MocksService();
