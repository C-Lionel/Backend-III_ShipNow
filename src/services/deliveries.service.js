
import mongoose from "mongoose";
import deliveriesRepository from "../repositories/deliveries.repository.js";
import ordersRepository from "../repositories/orders.repository.js";
import usersRepository from "../repositories/users.repository.js";
import AppError from "../utils/errors.js";
import { ErrorDictionary } from "../utils/errorDictionary.js";

import {
  USER_ROLES,
  DELIVERY_STATUS,
  DELIVERY_PRIORITY
} from "../constants/index.js";

class DeliveriesService {
  async findAll() {
    return deliveriesRepository.findAll();
  }

  async findById(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(ErrorDictionary.INVALID_DELIVERY_ID);
    }

    const delivery = await deliveriesRepository.findById(id);

    if (!delivery) {
      throw new AppError(ErrorDictionary.DELIVERY_NOT_FOUND);
    }

    return delivery;
  }

  async create(deliveryData) {
    const { order: orderId, driver: driverId } = deliveryData;

    if (!mongoose.isValidObjectId(orderId)) {
      throw new AppError(ErrorDictionary.INVALID_ORDER_ID);
    }

    const order = await ordersRepository.findById(orderId);

    if (!order) {
      throw new AppError(ErrorDictionary.ORDER_NOT_FOUND);
    }

    const existingDelivery = await deliveriesRepository.findByOrder(orderId);

    if (existingDelivery) {
      throw new AppError(ErrorDictionary.DELIVERY_ALREADY_EXISTS);
    }

    if (driverId != null) {
      if (!mongoose.isValidObjectId(driverId)) {
        throw new AppError(ErrorDictionary.INVALID_DRIVER_ID);
      }

      const driver = await usersRepository.findById(driverId);

      if (!driver || driver.role !== USER_ROLES.DRIVER) {
        throw new AppError(ErrorDictionary.INVALID_DRIVER);
      }
    }

    const delivery = await deliveriesRepository.create({
      order: orderId,
      driver: driverId ?? null,
      status: driverId ? DELIVERY_STATUS.ASSIGNED : DELIVERY_STATUS.PENDING,
      priority: deliveryData.priority ?? DELIVERY_PRIORITY.NORMAL,
      assignedAt: driverId ? new Date() : null,
      deliveredAt: null
    });

    await ordersRepository.update(orderId, {
      delivery: delivery._id
    });

    return delivery;
  }

  async update(id, deliveryData) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(ErrorDictionary.INVALID_DELIVERY_ID);
    }

    const delivery = await deliveriesRepository.findById(id);

    if (!delivery) {
      throw new AppError(ErrorDictionary.DELIVERY_NOT_FOUND);
    }

    // No permitimos cambiar el pedido asociado a la entrega
    if (deliveryData.order !== undefined) {
      throw new AppError(ErrorDictionary.DELIVERY_ORDER_CHANGE_FORBIDDEN);
    }

    // Validamos el repartidor si se intenta modificar
    if (deliveryData.driver !== undefined) {
      if (
        deliveryData.driver !== null &&
        !mongoose.isValidObjectId(deliveryData.driver)
      ) {
        throw new AppError(ErrorDictionary.INVALID_DRIVER_ID);
      }

      if (deliveryData.driver !== null) {
        const driver = await usersRepository.findById(deliveryData.driver);

        if (!driver || driver.role !== USER_ROLES.DRIVER) {
          throw new AppError(ErrorDictionary.INVALID_DRIVER);
        }
      }
    }

    const updatedDelivery = await deliveriesRepository.update(
      id,
      deliveryData
    );

    return updatedDelivery;
  }

  async delete(id) {
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError(ErrorDictionary.INVALID_DELIVERY_ID);
    }

    const delivery = await deliveriesRepository.findById(id);

    if (!delivery) {
      throw new AppError(ErrorDictionary.DELIVERY_NOT_FOUND);
    }

    await ordersRepository.update(delivery.order._id, {
      delivery: null
    });

    return deliveriesRepository.delete(id);
  }
}

export default new DeliveriesService();
