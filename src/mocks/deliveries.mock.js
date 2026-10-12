
import {
  DELIVERY_STATUS,
  DELIVERY_PRIORITY
} from "../constants/index.js";

const randomItem = (array) => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

export const generateMockDelivery = (orderId, driverId = null) => {
  const hasDriver = driverId !== null;

  return {
    order: orderId,
    driver: driverId,
    status: hasDriver
      ? DELIVERY_STATUS.ASSIGNED
      : DELIVERY_STATUS.PENDING,
    priority: DELIVERY_PRIORITY.NORMAL,
    assignedAt: hasDriver ? new Date() : null,
    deliveredAt: null
  };
};

export const generateMockDeliveries = (
  orderIds,
  driverIds = []
) => {
  if (!Array.isArray(orderIds)) {
    throw new Error("Se necesita un arreglo de pedidos");
  }

  return orderIds.map((orderId) => {
    const driverId = driverIds.length > 0
      ? randomItem(driverIds)
      : null;

    return generateMockDelivery(orderId, driverId);
  });
};
