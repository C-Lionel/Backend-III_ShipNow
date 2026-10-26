
import ordersRepository from "../repositories/orders.repository.js";
import usersRepository from "../repositories/users.repository.js";
import AppError from "../utils/errors.js";
import { ErrorDictionary } from "../utils/errorDictionary.js";
import logger from "../utils/logger.js";
import {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_PRIORITY
} from "../constants/index.js";

class OrdersService {
  async findAll(filter = {}) {
    return ordersRepository.findAll(filter);
  }

  async findById(id) {
    const order = await ordersRepository.findById(id);

    if (!order) {
      throw new AppError(ErrorDictionary.ORDER_NOT_FOUND);
    }

    return order;
  }

  async create(orderData) {
    const customer = await usersRepository.findById(orderData.customer);

    if (!customer) {
      throw new AppError(ErrorDictionary.ORDER_CUSTOMER_NOT_FOUND);
    }

    if (customer.role !== USER_ROLES.CUSTOMER) {
      throw new AppError(ErrorDictionary.INVALID_CUSTOMER_ROLE);
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new AppError(ErrorDictionary.ORDER_ITEMS_REQUIRED);
    }

    const itemsTotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const declaredValue = orderData.declaredValue ?? itemsTotal;

    const shippingCost = 10;

    const newOrder = await ordersRepository.create({
      ...orderData,
      declaredValue,
      shippingCost,
      total: itemsTotal + shippingCost,
      status: ORDER_STATUS.CREATED,
      priority: orderData.priority ?? DELIVERY_PRIORITY.NORMAL,
      delivery: null
    });

    logger.info(`Pedido creado correctamente con ID: ${newOrder._id}`);

    return newOrder;
  }

  async update(id, orderData) {
    const protectedFields = [
      "customer",
      "items",
      "total",
      "shippingCost",
      "declaredValue",
      "delivery"
    ];

    const hasProtectedFields = protectedFields.some(
      (field) => orderData[field] !== undefined
    );

    if (hasProtectedFields) {
      throw new AppError(ErrorDictionary.ORDER_PROTECTED_FIELDS);
    }

    const updatedOrder = await ordersRepository.update(
      id,
      orderData
    );

    if (!updatedOrder) {
      throw new AppError(ErrorDictionary.ORDER_NOT_FOUND);
    }

    return updatedOrder;
  }

  async delete(id) {
    const order = await ordersRepository.findById(id);

    if (!order) {
      throw new AppError(ErrorDictionary.ORDER_NOT_FOUND);
    }

    if (order.delivery) {
      throw new AppError(ErrorDictionary.ORDER_HAS_DELIVERY);
    }

    return ordersRepository.delete(id);
  }
}

export default new OrdersService();
