
import { ORDER_STATUS, DELIVERY_PRIORITY } from "../constants/index.js";

const products = [
  { name: "Teclado mecánico", price: 5000 },
  { name: "Mouse inalámbrico", price: 3000 },
  { name: "Monitor", price: 150000 },
  { name: "Auriculares", price: 25000 },
  { name: "Notebook", price: 850000 }
];

const addresses = [
  "San Martín 123",
  "Belgrano 456",
  "Mitre 789",
  "Rivadavia 250",
  "Sarmiento 980"
];

const randomItem = (array) => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

export const generateMockOrder = (customerId) => {
  const product = randomItem(products);
  const quantity = Math.floor(Math.random() * 3) + 1;

  const items = [
    {
      name: product.name,
      quantity,
      price: product.price
    }
  ];

  const declaredValue = product.price * quantity;
  const shippingCost = 10;

  return {
    customer: customerId,
    items,
    deliveryAddress: randomItem(addresses),
    total: declaredValue + shippingCost,
    shippingCost,
    declaredValue,
    status: ORDER_STATUS.CREATED,
    priority: DELIVERY_PRIORITY.NORMAL,
    delivery: null
  };
};

export const generateMockOrders = (quantity, customerIds) => {
  if (!Array.isArray(customerIds) || customerIds.length === 0) {
    throw new Error("Se necesita al menos un cliente para generar pedidos");
  }

  return Array.from({ length: quantity }, () => {
    const customerId = randomItem(customerIds);
    return generateMockOrder(customerId);
  });
};
