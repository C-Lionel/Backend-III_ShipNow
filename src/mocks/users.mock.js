
import { randomUUID } from "node:crypto";
import { USER_ROLES } from "../constants/index.js";

const firstNames = [
  "Juan",
  "María",
  "Carlos",
  "Lucía",
  "Pedro",
  "Sofía"
];

const lastNames = [
  "Pérez",
  "Gómez",
  "Rodríguez",
  "Fernández",
  "López",
  "Martínez"
];

const randomItem = (array) => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

export const generateMockUser = (role = USER_ROLES.CUSTOMER) => {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);

  const uniqueId = randomUUID();

  return {
    firstName,
    lastName,
    email: `mock.${uniqueId}@shipnow.test`,
    password: "Mock123456!",
    role,
    documents: []
  };
};

export const generateMockUsers = (
  quantity = 10,
  role = USER_ROLES.CUSTOMER
) => {
  return Array.from(
    { length: quantity },
    () => generateMockUser(role)
  );
};
