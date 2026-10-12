
import ordersRepository from "../repositories/orders.repository.js";
import usersRepository from "../repositories/users.repository.js";
import AppError from "../utils/errors.js";
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
      throw new AppError("Pedido no encontrado", 404);
    }

    return order;
  }

  async create(orderData) {
    const customer = await usersRepository.findById(orderData.customer);

    if (!customer) {
      throw new AppError("El cliente especificado no existe", 400);
    }

    if (customer.role !== USER_ROLES.CUSTOMER) {
      throw new AppError("El usuario no tiene rol de customer", 400);
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new AppError("El pedido debe tener al menos un item", 400);
    }

    const itemsTotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const declaredValue = orderData.declaredValue ?? itemsTotal;

    const shippingCost = 10;

    return ordersRepository.create({
      ...orderData,
      declaredValue,
      shippingCost,
      total: itemsTotal + shippingCost,
      status: ORDER_STATUS.CREATED,
      priority: orderData.priority ?? DELIVERY_PRIORITY.NORMAL,
      delivery: null
    });
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
      throw new AppError(
        "No está permitido modificar campos protegidos del pedido",
        403
      );
    }

    const updatedOrder = await ordersRepository.update(
      id,
      orderData
    );

    if (!updatedOrder) {
      throw new AppError("Pedido no encontrado", 404);
    }

    return updatedOrder;
  }



  async delete(id) {
    const order = await ordersRepository.findById(id);

    if (!order) {
      throw new AppError("Pedido no encontrado", 404);
    }

    if (order.delivery) {
      throw new AppError(
        "No se puede eliminar un pedido que tiene una entrega asociada",
        409
      );
    }

    return ordersRepository.delete(id);
  }

}

export default new OrdersService();
