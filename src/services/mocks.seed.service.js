
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Delivery from "../models/delivery.model.js";

import { USER_ROLES } from "../constants/index.js";

import { generateMockUsers } from "../mocks/users.mock.js";
import { generateMockOrders } from "../mocks/orders.mock.js";
import { generateMockDeliveries } from "../mocks/deliveries.mock.js";

import AppError from "../utils/errors.js";
import { ErrorDictionary } from "../utils/errorDictionary.js";

import logger from "../utils/logger.js";



class MocksSeedService {
  async seedUsers(quantity, session) {
    const customers = generateMockUsers(
      quantity,
      USER_ROLES.CUSTOMER
    );

    const drivers = generateMockUsers(
      quantity,
      USER_ROLES.DRIVER
    );

    const users = [...customers, ...drivers];

    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );

    const savedUsers = await User.insertMany(
      usersWithHashedPasswords,
      { session }
    );

    return {
      customers: savedUsers.filter(
        (user) => user.role === USER_ROLES.CUSTOMER
      ),
      drivers: savedUsers.filter(
        (user) => user.role === USER_ROLES.DRIVER
      )
    };
  }

  async seedOrders(quantity, customers, session) {
    const customerIds = customers.map(
      (customer) => customer._id
    );

    const orders = generateMockOrders(
      quantity,
      customerIds
    );

    return Order.insertMany(orders, { session });
  }

  async seedDeliveries(orders, drivers, session) {
    const orderIds = orders.map(
      (order) => order._id
    );

    const driverIds = drivers.map(
      (driver) => driver._id
    );

    const deliveries = generateMockDeliveries(
      orderIds,
      driverIds
    );

    const savedDeliveries = await Delivery.insertMany(
      deliveries,
      { session }
    );

    // Relacionamos cada pedido con su entrega.
    // Usamos operaciones secuenciales dentro de la transacción.
    for (const delivery of savedDeliveries) {
      await Order.findByIdAndUpdate(
        delivery.order,
        { delivery: delivery._id },
        { session }
      );
    }

    return savedDeliveries;
  }

  async seed(quantity = 10) {
    // El seed solamente puede ejecutarse en desarrollo.
    if (process.env.NODE_ENV !== "development") {
      throw new AppError(ErrorDictionary.SEED_FORBIDDEN);
    }

    // Validamos la cantidad solicitada.
    const qty = Number(quantity);

    if (
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 100
    ) {
      throw new AppError(ErrorDictionary.INVALID_MOCK_QUANTITY);
    }

    logger.info(`Iniciando seed de ShipNow con cantidad: ${qty}`);

    // Iniciamos una sesión de MongoDB.
    const session = await mongoose.startSession();

    try {
      let result;

      // Todas las inserciones forman parte de una transacción.
      await session.withTransaction(async () => {
        // 1. Guardamos clientes y repartidores.
        const { customers, drivers } =
          await this.seedUsers(qty, session);

        // 2. Guardamos pedidos relacionados con los clientes.
        const orders = await this.seedOrders(
          qty,
          customers,
          session
        );

        // 3. Guardamos entregas y actualizamos los pedidos.
        const deliveries = await this.seedDeliveries(
          orders,
          drivers,
          session
        );

        // Preparamos el resumen de los documentos creados.
        result = {
          customers: customers.length,
          drivers: drivers.length,
          orders: orders.length,
          deliveries: deliveries.length
        };
      });

      logger.info(
        `Seed completado correctamente: ${result.customers} clientes, ` +
        `${result.drivers} repartidores, ${result.orders} pedidos y ` +
        `${result.deliveries} entregas`
      );

      return result;
    } finally {
      // Cerramos la sesión, tanto si funciona como si falla.
      await session.endSession();
    }
  }
}

export default new MocksSeedService();
